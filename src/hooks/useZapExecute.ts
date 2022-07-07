import { t } from "@lingui/macro";
import { BigNumber, ContractReceipt, ethers } from "ethers";
import { useMutation, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { NetworkId } from "src/constants";
import { GRIP_ADDRESSES } from "src/constants/addresses";
import { trackGAEvent } from "src/helpers/analytics/trackGAEvent";
import { isSupportedChain } from "src/helpers/ZapHelper";
import { addresses } from "src/networkDetails";
import { error, info } from "src/slices/MessagesSlice";

import { SRIP_ADDRESSES } from "../constants/addresses";
import { DecimalBigNumber } from "../helpers/DecimalBigNumber/DecimalBigNumber";
import { Environment } from "../helpers/environment/Environment/Environment";
import { Zap__factory } from "../typechain/factories/Zap__factory";
import { balanceQueryKey } from "./useBalances";
import { zapTokenBalancesKey } from "./useZapTokenBalances";
import { useWeb3Context } from "./web3Context";

interface ZapTransactionResponse {
  to: string;
  data: string;
  estimatedGas: string;
  buyAmount: string;
}

interface IUADataZap {
  address: string;
  value: string;
  token: string;
  type: string;
  slippage: string;
  approved: boolean;
}

interface ZapExecuteOptions {
  slippage: string;
  sellAmount: BigNumber;
  tokenAddress: string;
  minimumAmount: string;
  gRIP: boolean;
}

export const useZapExecute = () => {
  const dispatch = useDispatch();
  const client = useQueryClient();
  const { address, provider: library, networkId: chainId } = useWeb3Context();
  const signer = library.getSigner();

  return useMutation<ContractReceipt, Error, ZapExecuteOptions>(
    /**
     * Ideally the parameters to this async function should be the slippage, etc.
     * However the `mutationFn` parameter to `useMutation` accepts a function with
     * one parameter only, and it wasn't working when passing an object with a defined interface.
     * So the parameters are moved up a level.
     */
    async ({ slippage, sellAmount, tokenAddress, minimumAmount, gRIP }) => {
      if (!slippage || isNaN(Number(slippage))) throw new Error(t`Slippage should be a number`);

      if (!tokenAddress) throw new Error(t`The tokenAddress parameter must be set`);
      if (!signer) throw new Error(t`Signer is not set`);

      const minimumAmountNumber = new DecimalBigNumber(minimumAmount);
      if (!minimumAmount || !minimumAmountNumber.gt("0")) throw new Error(t`Minimum amount must be greater than 0`);

      if (!isSupportedChain(chainId)) {
        dispatch(error(t`Zaps are only available on Ethereum Mainnet. Please switch networks.`));
        throw new Error(t`Zaps are only available on Ethereum Mainnet. Please switch networks.`);
      }

      // We only operate on Ethereum mainnet for the moment, so we can use a static contract
      const contract = Zap__factory.connect(addresses[chainId].ZAP, signer);
      if (!contract) throw new Error(t`Unable to access Zap contract on network ${chainId}`);

      const toToken: any = gRIP
        ? GRIP_ADDRESSES[chainId as keyof typeof GRIP_ADDRESSES]
        : SRIP_ADDRESSES[chainId as keyof typeof SRIP_ADDRESSES];
      if (!toToken)
        throw new Error(t`Unable to fetch address for token (${gRIP ? "gRIP" : "sRIP"}) on network ${chainId}`);

      const additionalOptions = {
        ...(tokenAddress === ethers.constants.AddressZero && { value: sellAmount }),
      };

      console.debug("Fetching token swap data from Zapper");
      if (!address) throw new Error(t`Account is not set`);
      const swapData = await fetchSwapData(address, sellAmount, tokenAddress, +slippage / 100);

      console.debug("Commencing Zap");
      const transaction = await contract.ZapStake(
        tokenAddress,
        sellAmount,
        toToken,
        ethers.utils.parseUnits(minimumAmount, gRIP ? 18 : 9),
        swapData.to,
        swapData.data,
        address,
        additionalOptions,
      );

      console.debug("Awaiting transaction");
      return transaction.wait();
    },
    {
      onError: (e, variables) => {
        if (!address) throw new Error(t`Account is not set`);
        const uaData: IUADataZap = {
          address,
          value: variables.sellAmount.toString(),
          token: variables.tokenAddress,
          type: "Zap Swap Failure",
          slippage: variables.slippage,
          approved: false,
        };
        trackGAEvent({
          category: "RipZaps",
          action: uaData.type,
          metric1: parseFloat(uaData.value),
        });

        console.error(`Encountered error while executing Zap: ${e.message}`);

        if (e.message.indexOf("High Slippage") > 0) {
          dispatch(error(t`Transaction would fail due to slippage. Please use a higher slippage tolerance value.`));
        } else if (e.message.indexOf("TRANSFER_AMOUNT_EXCEEDS_BALANCE") > 0) {
          dispatch(error(t`Insufficient balance.`));
        } else {
          dispatch(error(e.message));
        }

        /**
         * NOTE: Previously, ZapSlice would re-throw the error here.
         * Re-throwing within react-query prevents the states (e.g. `isLoading`)
         * from being set correctly, so we don't do that.
         */
      },
      onSuccess: (_data, variables) => {
        console.debug("Zap successful");
        if (!address) throw new Error(t`Account is not set`);
        const uaData: IUADataZap = {
          address,
          value: variables.sellAmount.toString(),
          token: variables.tokenAddress,
          type: "Zap Swap Success",
          slippage: variables.slippage,
          approved: true,
        };
        trackGAEvent({
          category: "RipZaps",
          action: uaData.type,
          metric1: parseFloat(uaData.value),
        });

        dispatch(info("Successful Zap!"));

        // We force a refresh of balances, but don't wait on the result
        const keysToRefetch = [
          balanceQueryKey(address, SRIP_ADDRESSES, NetworkId.MAINNET),
          balanceQueryKey(address, GRIP_ADDRESSES, NetworkId.MAINNET),
          zapTokenBalancesKey(address),
        ];
        const promises = keysToRefetch.map(key => client.refetchQueries(key, { active: true }));
        Promise.all(promises);
      },
    },
  );
};

const fetchSwapData = async (
  address: string,
  sellAmount: BigNumber,
  tokenAddress: string,
  slippageDecimal: number,
): Promise<ZapTransactionResponse> => {
  tokenAddress = tokenAddress.toLowerCase();
  const apiKey = Environment.getZapperApiKey();
  const response = await fetch(
    `https://api.zapper.fi/v1/exchange/quote?sellTokenAddress=${tokenAddress}&buyTokenAddress=0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5&sellAmount=${sellAmount}&slippagePercentage=${slippageDecimal}&network=ethereum&api_key=${apiKey}&ownerAddress=${address}&isZap=true`,
  );
  const responseJson = await response.json();
  if (response.ok) {
    return responseJson;
  } else {
    throw Error(JSON.stringify(responseJson));
  }
};

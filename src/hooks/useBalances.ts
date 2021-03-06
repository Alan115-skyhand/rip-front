import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { useQuery } from "react-query";
import { NetworkId } from "src/constants";
import {
  AddressMap,
  GRIP_ADDRESSES,
  RIP_ADDRESSES,
  SRIP_ADDRESSES,
  V1_RIP_ADDRESSES,
  V1_SRIP_ADDRESSES,
  WSRIP_ADDRESSES,
} from "src/constants/addresses";
import { assert, queryAssertion } from "src/helpers";
import { covalent } from "src/lib/covalent";
import { CovalentTokenBalance } from "src/lib/covalent.types";

import { useWeb3Context } from ".";

const unstable_Object = Object as unstable_ObjectConstructor;

type Balances = Record<keyof typeof covalent.SUPPORTED_NETWORKS, CovalentTokenBalance[]>;

export const balancesQueryKey = (address?: string) => ["useBalances", address];

export const useBalances = <TSelectData = unknown>(select: (data: Balances) => TSelectData) => {
  const { address } = useWeb3Context();

  return useQuery<Balances, Error, TSelectData>(
    balancesQueryKey(address),
    async () => {
      queryAssertion(address, balancesQueryKey());

      // Map all networkId's to a promise that resolves to a list of all token balances
      const promises = unstable_Object
        .keys(covalent.SUPPORTED_NETWORKS)
        .map(networkId => covalent.balances.getAllTokens(address, networkId));

      // Run all requests in parallel
      const responses = await Promise.all(promises);

      // Convert array of reponses back to a single object
      return unstable_Object
        .keys(covalent.SUPPORTED_NETWORKS)
        .reduce((prev, networkId, index) => Object.assign(prev, { [networkId]: responses[index] }), {} as Balances);
    },
    { enabled: !!address, select },
  );
};

const getBalance = (balances: Balances, addressMap: AddressMap, networkId: NetworkId) => {
  if (!covalent.isSupportedNetwork(networkId)) return BigNumber.from(0);

  const covalentTokens = balances[networkId as keyof typeof covalent.SUPPORTED_NETWORKS];
  const tokenAddress = addressMap[networkId];

  assert(tokenAddress, "addressMap[networkId] should always exist");

  const token = covalentTokens.find(token => token.contract_address.toLowerCase() === tokenAddress.toLowerCase());

  if (!token) return BigNumber.from(0);

  return parseUnits(token.balance, token.contract_decimals);
};

/**
 * Returns a balance.
 * @param addressMap Address map of the token you want the balance of.
 */
const useBalance = <TAddressMap extends AddressMap = AddressMap>(addressMap: TAddressMap) => {
  return useBalances<Record<keyof typeof addressMap, BigNumber>>(balances => {
    return unstable_Object
      .keys(addressMap)
      .reduce(
        (prev, networkId) => Object.assign(prev, { [networkId]: getBalance(balances, addressMap, networkId) }),
        {} as Record<keyof typeof addressMap, BigNumber>,
      );
  });
};

export const useRipBalance = () => useBalance(RIP_ADDRESSES);
export const useSripBalance = () => useBalance(SRIP_ADDRESSES);
export const useGripBalance = () => useBalance(GRIP_ADDRESSES);
export const useWsripBalance = () => useBalance(WSRIP_ADDRESSES);
export const useV1RipBalance = () => useBalance(V1_RIP_ADDRESSES);
export const useV1SripBalance = () => useBalance(V1_SRIP_ADDRESSES);

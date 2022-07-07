import { BigNumber } from "@ethersproject/bignumber";
import { useQuery } from "react-query";
import { NetworkId } from "src/constants";
import {
  AddressMap,
  MIGRATOR_ADDRESSES,
  V1_RIP_ADDRESSES,
  V1_SRIP_ADDRESSES,
  WSRIP_ADDRESSES,
} from "src/constants/addresses";
import { queryAssertion } from "src/helpers";
import { nonNullable } from "src/helpers/types/nonNullable";

import { useWeb3Context } from ".";
import { useTokenContractForRip } from "./useContract";

export const contractAllowanceQueryKey = (
  address?: string,
  networkId?: NetworkId,
  tokenMap?: AddressMap,
  contractMap?: AddressMap,
) => ["useContractAllowances", address, networkId, tokenMap, contractMap].filter(nonNullable);

export const useContractAllowance = (tokenMap: AddressMap, contractMap: AddressMap) => {
  const { address, networkId } = useWeb3Context();
  const token = useTokenContractForRip(tokenMap);

  const key = contractAllowanceQueryKey(address, networkId, tokenMap, contractMap);
  return useQuery<BigNumber, Error>(
    key,
    async () => {
      queryAssertion(address && networkId, key);

      const contractAddress = contractMap[networkId as NetworkId];

      if (!token) throw new Error("Token doesn't exist on current network");
      if (!contractAddress) throw new Error("Contract doesn't exist on current network");

      return token.allowance(address, contractAddress);
    },
    { enabled: !!address },
  );
};

export const useWsripMigrationAllowance = () => useContractAllowance(WSRIP_ADDRESSES, MIGRATOR_ADDRESSES);
export const useV1RipMigrationAllowance = () => useContractAllowance(V1_RIP_ADDRESSES, MIGRATOR_ADDRESSES);
export const useV1SripMigrationAllowance = () => useContractAllowance(V1_SRIP_ADDRESSES, MIGRATOR_ADDRESSES);

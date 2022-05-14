import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber";
import BigNumber from "bignumber.js";
import { SerializedBigNumber } from "src/slices/types";

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);
export const BIG_NINE = new BigNumber(9);
export const BIG_TEN = new BigNumber(10);

export const ethersToSerializedBigNumber = (ethersBn: EthersBigNumber): SerializedBigNumber =>
  ethersToBigNumber(ethersBn).toJSON();

export const ethersToBigNumber = (ethersBn: EthersBigNumber): BigNumber => new BigNumber(ethersBn.toString());

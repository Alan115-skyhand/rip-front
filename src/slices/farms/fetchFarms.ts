import BigNumber from "bignumber.js";
import { SerializedFarmConfig } from "src/constants/types";

import { BIG_TEN, BIG_ZERO } from "../../utils/bigNumber";
import { SerializedFarm } from "../types";
import { fetchMasterChefData } from "./fetchMasterChefData";
import { fetchPublicFarmsData } from "./fetchPublicFarmData";

const fetchFarms = async (farmsToFetch: SerializedFarmConfig[]): Promise<SerializedFarm[]> => {
  const farmResult = await fetchPublicFarmsData(farmsToFetch);
  const masterChefResult = await fetchMasterChefData(farmsToFetch);

  return farmsToFetch.map((farm, index) => {
    const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals] =
      farmResult[index];

    const [info, totalRegularAllocPoint] = masterChefResult[index];

    // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
    const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply));

    // Raw amount of token in the LP, including those not staked
    const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals));
    const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals));

    // Amount of quoteToken in the LP that are staked in the MC
    const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio);

    // Total staked in LP, in quote token value
    const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2));

    const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO;
    const poolWeight = totalRegularAllocPoint ? allocPoint.div(new BigNumber(totalRegularAllocPoint)) : BIG_ZERO;

    return {
      ...farm,
      token: farm.token,
      quoteToken: farm.quoteToken,
      tokenAmountTotal: tokenAmountTotal.toJSON(),
      quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
      lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
      lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
      tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
      poolWeight: poolWeight.toJSON(),
      multiplier: `${allocPoint.div(100).toString()}X`,
    };
  });
};

export default fetchFarms;

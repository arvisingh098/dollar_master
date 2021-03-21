import React from "react";

import BigNumber from "bignumber.js";

//Components
import Distribution from "../../components/Distribution";
import "./style.css";

import { formatMoney, ownership } from "../../utils/number";

type RegulationHeaderProps = {
  totalSupply: BigNumber;

  totalBonded: BigNumber;
  totalStaged: BigNumber;
  totalRedeemable: BigNumber;

  poolLiquidity: BigNumber;
  poolRewarded: BigNumber;
  poolClaimable: BigNumber;

  legacyPoolRewarded: BigNumber;
  legacyPoolClaimable: BigNumber;

  totalDebt: BigNumber;
  totalCoupons: BigNumber;
  totalCouponsUnderlying: BigNumber;
  couponPremium: BigNumber;
};

const RegulationHeader = ({
  totalSupply,
  totalBonded,
  totalStaged,
  totalRedeemable,
  poolLiquidity,
  poolRewarded,
  poolClaimable,
  legacyPoolRewarded,
  legacyPoolClaimable,
  totalDebt,
  totalCoupons,
  totalCouponsUnderlying,
  couponPremium,
}: RegulationHeaderProps) => {
  totalBonded = totalBonded ? totalBonded : new BigNumber(0);
  const daoTotalSupply = totalStaged && totalRedeemable ? totalBonded.plus(totalStaged).plus(totalRedeemable) : new BigNumber(0);
  const poolTotalSupply = poolLiquidity.plus(poolRewarded).plus(poolClaimable);
  const legacyPoolTotalSupply = legacyPoolRewarded.plus(legacyPoolClaimable);
  const circulatingSupply = totalSupply
    .minus(daoTotalSupply)
    .minus(poolTotalSupply)
    .minus(legacyPoolTotalSupply);

    let daoSupply: any = +ownership(daoTotalSupply, totalSupply).toNumber().toFixed(2);
    daoSupply = daoSupply && daoSupply > 0 ? daoSupply : "0.00";

    let uniSupply: any = +ownership(poolTotalSupply, totalSupply).toNumber().toFixed(2);
    uniSupply = uniSupply && uniSupply > 0 ? uniSupply : "0.00";

    let cirSupply: any = +ownership(circulatingSupply, totalSupply).toNumber().toFixed(2);
    cirSupply = cirSupply && cirSupply > 0 ? cirSupply : "0.00";

    let bondPercent: any = +ownership(totalBonded, daoTotalSupply)
              .toNumber()
              .toFixed(2);
    bondPercent = bondPercent > 0 ? bondPercent : "0.00";

    let stagePercent: any = +ownership(totalStaged, daoTotalSupply)
              .toNumber()
              .toFixed(2);
    stagePercent = stagePercent > 0 ? stagePercent : "0.00";

    let redeemPercent: any = +ownership(totalRedeemable, daoTotalSupply)
              .toNumber()
              .toFixed(2);
    redeemPercent = redeemPercent > 0 ? redeemPercent : "0.00";

    let liqPercent: any = +ownership(poolLiquidity, poolTotalSupply)
              .toNumber()
              .toFixed(2);
    liqPercent = liqPercent > 0 ? liqPercent : "0.00";

    let rewPercent: any = +ownership(poolRewarded, poolTotalSupply)
              .toNumber()
              .toFixed(2);
    rewPercent = rewPercent > 0 ? rewPercent : "0.00";

    let claimPercent: any = +ownership(poolClaimable, poolTotalSupply)
              .toNumber()
              .toFixed(2);
    claimPercent = claimPercent > 0 ? claimPercent : "0.00";

  return (
    <div className="Header">
      <Distribution
        title="SUPPLY ALLOCATION"
        description={`∅${formatMoney(totalSupply.toNumber())}`}
        items={[
          {
            item: "DAO",
            percentage: daoSupply,
          },
          {
            item: "Uniswap",
            percentage: uniSupply,
          },
          {
            item: "Circulating",
            percentage: cirSupply,
          },
        ]}
      ></Distribution>
      <Distribution
        title="DAO BREAKDOWN"
        description={`∅${formatMoney(daoTotalSupply.toNumber())}`}
        items={[
          {
            item: "Bonded",
            percentage: bondPercent,
          },
          {
            item: "Staged",
            percentage: stagePercent,
          },
          {
            item: "Redeemable",
            percentage: redeemPercent,
          },
        ]}
      ></Distribution>
      <Distribution
        title="UNISWAP BREAKDOWN"
        description={`∅${formatMoney(poolTotalSupply.toNumber())}`}
        items={[
          {
            item: "Liquidity",
            percentage: liqPercent,
          },
          {
            item: "Rewarded",
            percentage: rewPercent,
          },
          {
            item: "Claimable",
            percentage: claimPercent,
          },
        ]}
      ></Distribution>
    </div>
  );
};

export default RegulationHeader;

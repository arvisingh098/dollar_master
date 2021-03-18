import React, { useState, useEffect } from "react";

import {
  getCouponPremium,
  getTotalCoupons,
  getTotalCouponsUnderlying,
  getPoolTotalClaimable,
  getPoolTotalRewarded,
  getTokenBalance,
  getTokenTotalSupply,
  getTotalBonded,
  getTotalDebt,
  getTotalRedeemable,
  getTotalStaged,
} from "../../utils/infura";
import { CLP, CLPS, UNI } from "../../constants/tokens";
import { toTokenUnitsBN } from "../../utils/number";
import BigNumber from "bignumber.js";
import RegulationHeader from "./Header";
import RegulationHistory from "./RegulationHistory";

//Components
import IconHeader from "../../components/IconHeader";

import { getLegacyPoolAddress, getPoolAddress } from "../../utils/pool";
import Container from "../../components/Container";

const ONE_COUPON = new BigNumber(10).pow(18);

function Regulation({ user }: { user: string }) {
  const [totalSupply, setTotalSupply] = useState(new BigNumber(0));
  const [totalBonded, setTotalBonded] = useState(new BigNumber(0));
  const [totalStaged, setTotalStaged] = useState(new BigNumber(0));
  const [totalRedeemable, setTotalRedeemable] = useState(new BigNumber(0));
  const [poolLiquidity, setPoolLiquidity] = useState(new BigNumber(0));
  const [poolTotalRewarded, setPoolTotalRewarded] = useState(new BigNumber(0));
  const [poolTotalClaimable, setPoolTotalClaimable] = useState(
    new BigNumber(0)
  );
  const [legacyPoolTotalRewarded, setLegacyPoolTotalRewarded] = useState(
    new BigNumber(0)
  );
  const [legacyPoolTotalClaimable, setLegacyPoolTotalClaimable] = useState(
    new BigNumber(0)
  );
  const [totalDebt, setTotalDebt] = useState(new BigNumber(0));
  const [totalCoupons, setTotalCoupons] = useState(new BigNumber(0));
  const [totalCouponsUnderlying, setTotalCouponsUnderlying] = useState(
    new BigNumber(0)
  );
  const [couponPremium, setCouponPremium] = useState(new BigNumber(0));

  useEffect(() => {
    let isCancelled = false;

    async function updateUserInfo() {
      const poolAddress = await getPoolAddress();
      const legacyPoolAddress = getLegacyPoolAddress(poolAddress);

      const [
        totalSupplyStr,
        totalBondedStr,
        totalStagedStr,
        totalRedeemableStr,
        poolLiquidityStr,
        poolTotalRewardedStr,
        poolTotalClaimableStr,
        legacyPoolTotalRewardedStr,
        legacyPoolTotalClaimableStr,
        totalDebtStr,
        totalCouponsStr,
        totalCouponsUnderlyingStr,
      ] = await Promise.all([
        getTokenTotalSupply(CLP.addr),

        getTotalBonded(CLPS.addr),
        getTotalStaged(CLPS.addr),
        getTotalRedeemable(CLPS.addr),

        getTokenBalance(CLP.addr, UNI.addr),
        getPoolTotalRewarded(poolAddress),
        getPoolTotalClaimable(poolAddress),

        getPoolTotalRewarded(legacyPoolAddress),
        getPoolTotalClaimable(legacyPoolAddress),

        getTotalDebt(CLPS.addr),
        getTotalCoupons(CLPS.addr),
        getTotalCouponsUnderlying(CLPS.addr),
      ]);

      if (!isCancelled) {
        setTotalSupply(toTokenUnitsBN(totalSupplyStr, CLP.decimals));

        setTotalBonded(toTokenUnitsBN(totalBondedStr, CLP.decimals));
        setTotalStaged(toTokenUnitsBN(totalStagedStr, CLP.decimals));
        setTotalRedeemable(toTokenUnitsBN(totalRedeemableStr, CLP.decimals));

        setPoolLiquidity(toTokenUnitsBN(poolLiquidityStr, CLP.decimals));
        setPoolTotalRewarded(
          toTokenUnitsBN(poolTotalRewardedStr, CLP.decimals)
        );
        setPoolTotalClaimable(
          toTokenUnitsBN(poolTotalClaimableStr, CLP.decimals)
        );

        setLegacyPoolTotalRewarded(
          toTokenUnitsBN(legacyPoolTotalRewardedStr, CLP.decimals)
        );
        setLegacyPoolTotalClaimable(
          toTokenUnitsBN(legacyPoolTotalClaimableStr, CLP.decimals)
        );

        setTotalDebt(toTokenUnitsBN(totalDebtStr, CLP.decimals));
        setTotalCoupons(toTokenUnitsBN(totalCouponsStr, CLP.decimals));
        setTotalCouponsUnderlying(
          toTokenUnitsBN(totalCouponsUnderlyingStr, CLP.decimals)
        );

        if (new BigNumber(totalDebtStr).isGreaterThan(ONE_COUPON)) {
          const couponPremiumStr = await getCouponPremium(
            CLPS.addr,
            ONE_COUPON
          );
          setCouponPremium(toTokenUnitsBN(couponPremiumStr, CLP.decimals));
        } else {
          setCouponPremium(new BigNumber(0));
        }
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [user]);

  return (
    <Container>
      <>
        <IconHeader
          icon={<i className="fas fa-chart-area" />}
          text="Supply Regulation"
        />

        <RegulationHeader
          totalSupply={totalSupply}
          totalBonded={totalBonded}
          totalStaged={totalStaged}
          totalRedeemable={totalRedeemable}
          poolLiquidity={poolLiquidity}
          poolRewarded={poolTotalRewarded}
          poolClaimable={poolTotalClaimable}
          legacyPoolRewarded={legacyPoolTotalRewarded}
          legacyPoolClaimable={legacyPoolTotalClaimable}
          totalDebt={totalDebt}
          totalCoupons={totalCoupons}
          totalCouponsUnderlying={totalCouponsUnderlying}
          couponPremium={couponPremium}
        />

        <h3 className="table-name">Regulation History</h3>

        <RegulationHistory user={user} />
      </>
    </Container>
  );
}

export default Regulation;

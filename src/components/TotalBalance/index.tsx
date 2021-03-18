import React, { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import {
  getBalanceBonded,
  getBalanceOfStaged,
  getPoolBalanceOfBonded,
  getPoolBalanceOfClaimable,
  getPoolBalanceOfRewarded,
  getPoolBalanceOfStaged,
  getTokenBalance,
  getTokenTotalSupply,
} from "../../utils/infura";
import { CLP, CLPS, UNI } from "../../constants/tokens";
import { formatBN, toTokenUnitsBN } from "../../utils/number";
import { getPoolAddress } from "../../utils/pool";

type TotalBalanceProps = {
  user: string;
};

function TotalBalance({ user }: TotalBalanceProps) {
  const [totalBalance, setTotalBalance] = useState(new BigNumber(0));

  //Update User balances
  useEffect(() => {
    if (user === "") {
      setTotalBalance(new BigNumber(0));
      return;
    }
    let isCancelled = false;

    async function updateUserInfo() {
      const poolAddress = await getPoolAddress();

      const [
        clpBalance,
        stagedBalance,
        bondedBalance,
        pairBalanceCLPStr,
        pairTotalSupplyUNIStr,
        userUNIBalanceStr,
        userPoolBondedBalanceStr,
        userPoolStagedBalanceStr,
        userPoolRewardedBalanceStr,
        userPoolClaimableBalanceStr,
      ] = await Promise.all([
        getTokenBalance(CLP.addr, user),
        getBalanceOfStaged(CLPS.addr, user),
        getBalanceBonded(CLPS.addr, user),

        getTokenBalance(CLP.addr, UNI.addr),
        getTokenTotalSupply(UNI.addr),
        getTokenBalance(UNI.addr, user),
        getPoolBalanceOfBonded(poolAddress, user),
        getPoolBalanceOfStaged(poolAddress, user),
        getPoolBalanceOfRewarded(poolAddress, user),
        getPoolBalanceOfClaimable(poolAddress, user),
      ]);

      const userBalance = toTokenUnitsBN(
        new BigNumber(clpBalance),
        CLP.decimals
      );
      const userStagedBalance = toTokenUnitsBN(
        new BigNumber(stagedBalance),
        CLPS.decimals
      );
      const userBondedBalance = toTokenUnitsBN(
        new BigNumber(bondedBalance),
        CLPS.decimals
      );

      const userUNIBalance = toTokenUnitsBN(
        new BigNumber(userUNIBalanceStr),
        CLPS.decimals
      );
      const userPoolBondedBalance = toTokenUnitsBN(
        new BigNumber(userPoolBondedBalanceStr),
        CLPS.decimals
      );
      const userPoolStagedBalance = toTokenUnitsBN(
        new BigNumber(userPoolStagedBalanceStr),
        CLPS.decimals
      );
      const userPoolRewardedBalance = toTokenUnitsBN(
        new BigNumber(userPoolRewardedBalanceStr),
        CLPS.decimals
      );
      const userPoolClaimableBalance = toTokenUnitsBN(
        new BigNumber(userPoolClaimableBalanceStr),
        CLPS.decimals
      );

      const UNItoCLP = new BigNumber(pairBalanceCLPStr).dividedBy(
        new BigNumber(pairTotalSupplyUNIStr)
      );

      const daoTotalBalance = userStagedBalance.plus(userBondedBalance);
      const poolTotalBalance = UNItoCLP.multipliedBy(
        userPoolStagedBalance.plus(userPoolBondedBalance)
      ).plus(userPoolRewardedBalance.plus(userPoolClaimableBalance));
      const circulationBalance = UNItoCLP.multipliedBy(userUNIBalance).plus(
        userBalance
      );

      const totalBalance = daoTotalBalance
        .plus(poolTotalBalance)
        .plus(circulationBalance);

      if (!isCancelled) {
        setTotalBalance(totalBalance);
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

  return <div>∅{formatBN(totalBalance, 2)}</div>;
}

export default TotalBalance;

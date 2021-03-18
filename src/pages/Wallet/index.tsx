import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import BigNumber from "bignumber.js";
import {
  getBalanceBonded,
  getBalanceOfStaged,
  getFluidUntil,
  getLockedUntil,
  getStatusOf,
  getTokenAllowance,
  getTokenBalance,
  getTokenTotalSupply,
} from "../../utils/infura";
import { CLP, CLPS } from "../../constants/tokens";
import { DAO_EXIT_LOCKUP_EPOCHS } from "../../constants/values";
import { toTokenUnitsBN } from "../../utils/number";

import AccountPageHeader from "./Header/index";
import WithdrawDeposit from "./WithdrawDeposit";
import BondUnbond from "./BondUnbond";
import { getPoolAddress } from "../../utils/pool";
import { DollarPool4 } from "../../constants/contracts";

//Components
import Container from "../../components/Container";
import Row from "../../components/Row";

//Style
import "./style.css";

function Wallet({ user }: { user: string }) {
  const { override } = useParams();
  if (override) {
    user = override;
  }

  const [userCLPBalance, setUserCLPBalance] = useState(new BigNumber(0));
  const [userCLPAllowance, setUserCLPAllowance] = useState(new BigNumber(0));
  const [userCLPSBalance, setUserCLPSBalance] = useState(new BigNumber(0));
  const [totalCLPSSupply, setTotalCLPSSupply] = useState(new BigNumber(0));
  const [userStagedBalance, setUserStagedBalance] = useState(new BigNumber(0));
  const [userBondedBalance, setUserBondedBalance] = useState(new BigNumber(0));
  const [userStatus, setUserStatus] = useState(0);
  const [userStatusUnlocked, setUserStatusUnlocked] = useState(0);
  const [lockup, setLockup] = useState(0);

  //Update User balances
  useEffect(() => {
    if (user === "") {
      setUserCLPBalance(new BigNumber(0));
      setUserCLPAllowance(new BigNumber(0));
      setUserCLPSBalance(new BigNumber(0));
      setTotalCLPSSupply(new BigNumber(0));
      setUserStagedBalance(new BigNumber(0));
      setUserBondedBalance(new BigNumber(0));
      setUserStatus(0);
      return;
    }
    let isCancelled = false;

    async function updateUserInfo() {
      const [
        CLPBalance,
        CLPAllowance,
        CLPsBalance,
        CLPsSupply,
        stagedBalance,
        bondedBalance,
        status,
        poolAddress,
        fluidUntilStr,
        lockedUntilStr,
      ] = await Promise.all([
        getTokenBalance(CLP.addr, user),
        getTokenAllowance(CLP.addr, user, CLPS.addr),
        getTokenBalance(CLPS.addr, user),
        getTokenTotalSupply(CLPS.addr),
        getBalanceOfStaged(CLPS.addr, user),
        getBalanceBonded(CLPS.addr, user),
        getStatusOf(CLPS.addr, user),
        getPoolAddress(),

        getFluidUntil(CLPS.addr, user),
        getLockedUntil(CLPS.addr, user),
      ]);

      const userCLPBalance = toTokenUnitsBN(CLPBalance, CLP.decimals);
      const userCLPSBalance = toTokenUnitsBN(CLPsBalance, CLPS.decimals);
      const totalCLPSSupply = toTokenUnitsBN(CLPsSupply, CLPS.decimals);
      const userStagedBalance = toTokenUnitsBN(stagedBalance, CLPS.decimals);
      const userBondedBalance = toTokenUnitsBN(bondedBalance, CLPS.decimals);
      const userStatus = parseInt(status, 10);
      const fluidUntil = parseInt(fluidUntilStr, 10);
      const lockedUntil = parseInt(lockedUntilStr, 10);

      if (!isCancelled) {
        setUserCLPBalance(new BigNumber(userCLPBalance));
        setUserCLPAllowance(new BigNumber(CLPAllowance));
        setUserCLPSBalance(new BigNumber(userCLPSBalance));
        setTotalCLPSSupply(new BigNumber(totalCLPSSupply));
        setUserStagedBalance(new BigNumber(userStagedBalance));
        setUserBondedBalance(new BigNumber(userBondedBalance));
        setUserStatus(userStatus);
        setUserStatusUnlocked(Math.max(fluidUntil, lockedUntil));
        setLockup(poolAddress === DollarPool4 ? DAO_EXIT_LOCKUP_EPOCHS : 1);
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
        <Row title="DAO">
          <AccountPageHeader
            accountCLPBalance={userCLPBalance}
            accountCLPSBalance={userCLPSBalance}
            totalCLPSSupply={totalCLPSSupply}
            accountStagedBalance={userStagedBalance}
            accountBondedBalance={userBondedBalance}
            accountStatus={userStatus}
            unlocked={userStatusUnlocked}
          />
        </Row>

        <Row title="STAGE">
          <WithdrawDeposit
            user={user}
            balance={userCLPBalance}
            allowance={userCLPAllowance}
            stagedBalance={userStagedBalance}
            status={userStatus}
          />
        </Row>

        <Row title="BOND">
          <BondUnbond
            staged={userStagedBalance}
            bonded={userBondedBalance}
            status={userStatus}
            lockup={lockup}
          />
        </Row>
      </>
    </Container>
  );
}

export default Wallet;

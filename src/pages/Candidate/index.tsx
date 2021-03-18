import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {
  getApproveFor,
  getEpoch,
  getIsInitialized,
  getPeriodFor,
  getRecordedVote,
  getRejectFor,
  getStartFor,
  getStatusOf,
  getTokenBalance,
  getTokenTotalSupply,
  getTotalBondedAt,
} from "../../utils/infura";
import { proposalStatus } from "../../utils/gov";
import { CLPS } from "../../constants/tokens";
import { toTokenUnitsBN } from "../../utils/number";
import BigNumber from "bignumber.js";
import Vote from "./Vote";
import VoteHeader from "./VoteHeader";
import CommitHeader from "./CommitHeader";
import Commit from "./Commit";

//Components
import IconHeader from "../../components/IconHeader";
import Row from "../../components/Row";
import Container from "../../components/Container";
import { start_and_end } from "../../utils/string";

function Candidate({ user }: { user: string }) {
  const { candidate } = useParams();

  const [approveFor, setApproveFor] = useState(new BigNumber(0));
  const [rejectFor, setRejectFor] = useState(new BigNumber(0));
  const [totalStake, setTotalStake] = useState(new BigNumber(0));
  const [vote, setVote] = useState(0);
  const [status, setStatus] = useState(0);
  const [userStake, setUserStake] = useState(new BigNumber(0));
  const [epoch, setEpoch] = useState(0);
  const [startEpoch, setStartEpoch] = useState(0);
  const [periodEpoch, setPeriodEpoch] = useState(0);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user === "") {
      setVote(0);
      setStatus(0);
      setUserStake(new BigNumber(0));
      return;
    }
    let isCancelled = false;

    async function updateUserInfo() {
      const [voteStr, statusStr, userStakeStr] = await Promise.all([
        getRecordedVote(CLPS.addr, user, candidate),
        getStatusOf(CLPS.addr, user),
        getTokenBalance(CLPS.addr, user),
      ]);

      if (!isCancelled) {
        setVote(parseInt(voteStr, 10));
        setStatus(parseInt(statusStr, 10));
        setUserStake(toTokenUnitsBN(userStakeStr, CLPS.decimals));
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [user, candidate]);

  useEffect(() => {
    let isCancelled = false;

    async function updateUserInfo() {
      let [
        approveForStr,
        rejectForStr,
        totalStakeStr,
        epochStr,
        startForStr,
        periodForStr,
        isInitialized,
      ] = await Promise.all([
        getApproveFor(CLPS.addr, candidate),
        getRejectFor(CLPS.addr, candidate),
        getTokenTotalSupply(CLPS.addr),
        getEpoch(CLPS.addr),
        getStartFor(CLPS.addr, candidate),
        getPeriodFor(CLPS.addr, candidate),
        getIsInitialized(CLPS.addr, candidate),
      ]);

      const epochN = parseInt(epochStr, 10);
      const startN = parseInt(startForStr, 10);
      const periodN = parseInt(periodForStr, 10);

      const endsAfter = startN + periodN - 1;
      if (epochN > endsAfter) {
        totalStakeStr = await getTotalBondedAt(CLPS.addr, endsAfter);
      }

      if (!isCancelled) {
        setApproveFor(toTokenUnitsBN(approveForStr, CLPS.decimals));
        setRejectFor(toTokenUnitsBN(rejectForStr, CLPS.decimals));
        setTotalStake(toTokenUnitsBN(totalStakeStr, CLPS.decimals));
        setEpoch(epochN);
        setStartEpoch(startN);
        setPeriodEpoch(periodN);
        setInitialized(isInitialized);
      }
    }
    updateUserInfo();
    const id = setInterval(updateUserInfo, 15000);

    // eslint-disable-next-line consistent-return
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [candidate]);

  return (
    <Container>
      <>
        <IconHeader icon={<i className="fas fa-poll" />} text="Candidate" />
        <h3>{start_and_end(candidate)} </h3>

        <Row title="">
          <VoteHeader
            approveFor={approveFor}
            rejectFor={rejectFor}
            totalStake={totalStake}
            showParticipation={startEpoch > 106}
          />
        </Row>

        <Row title="Vote">
          <Vote
            candidate={candidate}
            stake={userStake}
            vote={vote}
            status={status}
          />
        </Row>
        <Row title="Commit">
          <CommitHeader
            epoch={epoch}
            startEpoch={startEpoch}
            periodEpoch={periodEpoch}
          />
        </Row>
        <Row title="">
          <Commit
            user={user}
            candidate={candidate}
            epoch={epoch}
            startEpoch={startEpoch}
            periodEpoch={periodEpoch}
            initialized={initialized}
            approved={
              proposalStatus(
                epoch,
                startEpoch,
                periodEpoch,
                false,
                approveFor,
                rejectFor,
                totalStake
              ) === "Approved"
            }
          />
        </Row>
      </>
    </Container>
  );
}

export default Candidate;

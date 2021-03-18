import React from "react";
import BigNumber from "bignumber.js";
import { recordVote } from "../../utils/web3";

import { CLPS } from "../../constants/tokens";

//Components
import Container from "../../components/Container";
import Button from "../../components/Button";
import TextBlock from "../../components/TextBlock";
import BalanceBlock from "../../components/BalanceBlock";

type VoteProps = {
  candidate: string;
  stake: BigNumber;
  vote: number;
  status: number;
};

const VOTE_TYPE_MAP = ["Undecided", "Approve", "Reject"];

function Vote({ candidate, stake, vote, status }: VoteProps) {
  return (
    <>
      <ul>
        <li>
          <BalanceBlock asset="My Stake" balance={stake} suffix={"CLPS"} />
        </li>
        <li>
          <TextBlock label="My Vote" text={VOTE_TYPE_MAP[vote]} />
        </li>
        <li>
          <Button
            title="Unvote"
            onButtonClick={() => {
              recordVote(CLPS.addr, candidate, 0);
            }}
            disabled={status === 1 || vote === 0 || stake.isZero()}
          />
        </li>

        <li>
          <Button
            title="Accept"
            onButtonClick={() => {
              recordVote(CLPS.addr, candidate, 1);
            }}
            disabled={status === 1 || vote === 1 || stake.isZero()}
          />
        </li>
        <li>
          <Button
            title="Reject"
            onButtonClick={() => {
              recordVote(CLPS.addr, candidate, 2);
            }}
            disabled={status === 1 || vote === 2 || stake.isZero()}
          />
        </li>
      </ul>
    </>
  );
}

export default Vote;

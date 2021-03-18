import React from "react";
import BigNumber from "bignumber.js";

//Components
import BalanceBlock from "../../../components/BalanceBlock";
import TextBlock from "../../../components/TextBlock";

//Utils
import { ownership } from "../../../utils/number";

//Style
import "./index.css";

type AccountPageHeaderProps = {
  accountCLPBalance: BigNumber;
  accountCLPSBalance: BigNumber;
  totalCLPSSupply: BigNumber;
  accountStagedBalance: BigNumber;
  accountBondedBalance: BigNumber;
  accountStatus: number;
  unlocked: number;
};

const STATUS_MAP = ["Unlocked", "Locked", "Locked"];

function status(accountStatus, unlocked) {
  return (
    STATUS_MAP[accountStatus] +
    (accountStatus === 0 ? "" : " until " + unlocked)
  );
}

const AccountPageHeader = ({
  accountCLPBalance,
  accountCLPSBalance,
  totalCLPSSupply,
  accountStagedBalance,
  accountBondedBalance,
  accountStatus,
  unlocked,
}: AccountPageHeaderProps) => (
  <ul>
    <li>
      <BalanceBlock
        asset="Balance"
        balance={accountCLPBalance}
        suffix={" CLP"}
      />
    </li>
    <li>
      <BalanceBlock
        asset="Staged"
        balance={accountStagedBalance}
        suffix={" CLP"}
      />
    </li>
    <li>
      <BalanceBlock
        asset="Bonded"
        balance={accountBondedBalance}
        suffix={" CLP"}
      />
    </li>
    <li>
      <BalanceBlock
        asset="DAO Ownership"
        balance={ownership(accountCLPSBalance, totalCLPSSupply)}
        suffix={"%"}
      />
    </li>
    <li>
      <TextBlock label="Status" text={status(accountStatus, unlocked)} />
    </li>
  </ul>
);

export default AccountPageHeader;

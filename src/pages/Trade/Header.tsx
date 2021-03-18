import React from "react";
import BigNumber from "bignumber.js";

//Components
import AddressBlock from "../../components/AddressBlock";
import BalanceBlock from "../../components/BalanceBlock";

type TradePageHeaderProps = {
  pairBalanceCLP: BigNumber;
  pairBalanceUSDC: BigNumber;
  uniswapPair: string;
};

const TradePageHeader = ({
  pairBalanceCLP,
  pairBalanceUSDC,
  uniswapPair,
}: TradePageHeaderProps) => {
  const price = pairBalanceUSDC.dividedBy(pairBalanceCLP);

  return (
    <ul>
      <li>
        <BalanceBlock asset="CLP Price" balance={price} suffix={"USDC"} />
      </li>
      <li>
        <BalanceBlock
          asset="CLP Liquidity"
          balance={pairBalanceCLP}
          suffix={"CLP"}
        />
      </li>
      <li>
        <BalanceBlock
          asset="USDC Liquidity"
          balance={pairBalanceUSDC}
          suffix={"USDC"}
        />
      </li>
      <li>
        <AddressBlock label="Uniswap Contract" address={uniswapPair} />
      </li>
    </ul>
  );
};

export default TradePageHeader;

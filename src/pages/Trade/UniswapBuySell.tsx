import React, { useState } from "react";

import BigNumber from "bignumber.js";
import { buyCLP, sellCLP } from "../../utils/web3";

import { getCost, getProceeds } from "../../utils/infura";

import { isPos, toBaseUnitBN, toTokenUnitsBN } from "../../utils/number";
import { CLP, USDC } from "../../constants/tokens";
import {
  decreaseWithSlippage,
  increaseWithSlippage,
} from "../../utils/calculation";

//Components
import Container from "../../components/Container";
import Button from "../../components/Button";
import BalanceBlock from "../../components/BalanceBlock";
import PriceSection from "../../components/PriceSection";
import MaxButton from "../../components/MaxButton";
import BigNumberInput from "../../components/BigNumInput";

type UniswapBuySellProps = {
  userBalanceCLP: BigNumber;
  pairBalanceCLP: BigNumber;
};

function UniswapBuySell({
  userBalanceCLP,
  pairBalanceCLP,
}: UniswapBuySellProps) {
  const [buyAmount, setBuyAmount] = useState(new BigNumber(0));
  const [sellAmount, setSellAmount] = useState(new BigNumber(0));
  const [cost, setCost] = useState(new BigNumber(0));
  const [proceeds, setProceeds] = useState(new BigNumber(0));

  const updateCost = async (buyAmount) => {
    const buyAmountBN = new BigNumber(buyAmount);
    if (buyAmountBN.lte(new BigNumber(0))) {
      setCost(new BigNumber(0));
      return;
    }
    if (buyAmountBN.gte(pairBalanceCLP)) {
      setCost(new BigNumber(0));
      return;
    }
    const cost = await getCost(toBaseUnitBN(buyAmountBN, CLP.decimals));
    setCost(toTokenUnitsBN(new BigNumber(cost), USDC.decimals));
  };

  const updateProceeds = async (sellAmount) => {
    const sellAmountBN = new BigNumber(sellAmount);
    if (sellAmountBN.lte(new BigNumber(0))) {
      setProceeds(new BigNumber(0));
      return;
    }
    const proceeds = await getProceeds(
      toBaseUnitBN(sellAmountBN, CLP.decimals)
    );
    setProceeds(toTokenUnitsBN(new BigNumber(proceeds), USDC.decimals));
  };

  return (
    <Container>
      <div>
        {/* total Issued */}
        <div>
          <BalanceBlock
            asset="Døllar Balance"
            balance={userBalanceCLP}
            suffix={" CLP"}
          />
        </div>
        {/* Buy Token from Uniswap */}
        <div>
          <div>
            <div>
              <BigNumberInput
                adornment="CLP"
                value={buyAmount}
                setter={(value) => {
                  setBuyAmount(value);
                  isPos(value) ? updateCost(value) : updateCost("0");
                }}
              />
            </div>
            <div>
              <Button
                title="Buy"
                onButtonClick={() => {
                  buyCLP(
                    toBaseUnitBN(buyAmount, CLP.decimals),
                    increaseWithSlippage(toBaseUnitBN(cost, USDC.decimals))
                  );
                }}
              />
            </div>
          </div>
          <PriceSection label="Cost: " amt={cost} symbol=" USDC" />
        </div>
        <div />
        {/* Sell Token on Uniswap */}
        <div>
          <div>
            <div>
              <>
                <BigNumberInput
                  adornment="CLP"
                  value={sellAmount}
                  setter={(value) => {
                    setSellAmount(value);
                    isPos(value) ? updateProceeds(value) : updateProceeds("0");
                  }}
                />
                <MaxButton
                  onClick={() => {
                    setSellAmount(userBalanceCLP);
                    updateProceeds(userBalanceCLP);
                  }}
                />
                <PriceSection
                  label="Proceeds: "
                  amt={proceeds}
                  symbol=" USDC"
                />
              </>
            </div>
            <div>
              <Button
                title="Sell"
                onButtonClick={() => {
                  sellCLP(
                    toBaseUnitBN(sellAmount, CLP.decimals),
                    decreaseWithSlippage(toBaseUnitBN(proceeds, USDC.decimals))
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default UniswapBuySell;

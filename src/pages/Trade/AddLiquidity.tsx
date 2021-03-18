import React, { useState } from "react";
import BigNumber from "bignumber.js";
import { addLiquidity } from "../../utils/web3";

import { toBaseUnitBN, toTokenUnitsBN } from "../../utils/number";
import { CLP, UNI, USDC } from "../../constants/tokens";
import { SLIPPAGE } from "../../utils/calculation";

//Components
import Container from "../../components/Container";
import BigNumberInput from "../../components/BigNumInput";
import BalanceBlock from "../../components/BalanceBlock";
import MaxButton from "../../components/MaxButton";
import PriceSection from "../../components/PriceSection";
import Button from "../../components/Button";

type AddliquidityProps = {
  userBalanceCLP: BigNumber;
  userBalanceUSDC: BigNumber;
  pairBalanceCLP: BigNumber;
  pairBalanceUSDC: BigNumber;
  pairTotalSupplyUNI: BigNumber;
};

function AddLiquidity({
  userBalanceCLP,
  userBalanceUSDC,
  pairBalanceCLP,
  pairBalanceUSDC,
  pairTotalSupplyUNI,
}: AddliquidityProps) {
  const [amountUSDC, setAmountUSDC] = useState(new BigNumber(0));
  const [amountCLP, setAmountCLP] = useState(new BigNumber(0));
  const [amountUNI, setAmountUNI] = useState(new BigNumber(0));

  const USDCToCLPRatio = pairBalanceUSDC.isZero()
    ? new BigNumber(1)
    : pairBalanceUSDC.div(pairBalanceCLP);
  const CLPToUSDCRatio = pairBalanceCLP.isZero()
    ? new BigNumber(1)
    : pairBalanceCLP.div(pairBalanceUSDC);

  const onChangeAmountUSDC = (amountUSDC) => {
    if (!amountUSDC) {
      setAmountCLP(new BigNumber(0));
      setAmountUSDC(new BigNumber(0));
      setAmountUNI(new BigNumber(0));
      return;
    }

    const amountUSDCBN = new BigNumber(amountUSDC);
    setAmountUSDC(amountUSDCBN);

    const amountUSDCBU = toBaseUnitBN(amountUSDCBN, USDC.decimals);
    const newAmountCLP = toTokenUnitsBN(
      amountUSDCBU
        .multipliedBy(CLPToUSDCRatio)
        .integerValue(BigNumber.ROUND_FLOOR),
      USDC.decimals
    );
    setAmountCLP(newAmountCLP);

    const newAmountCLPBU = toBaseUnitBN(newAmountCLP, CLP.decimals);
    const pairTotalSupplyBU = toBaseUnitBN(pairTotalSupplyUNI, UNI.decimals);
    const pairBalanceCLPBU = toBaseUnitBN(pairBalanceCLP, CLP.decimals);
    const newAmountUNIBU = pairTotalSupplyBU
      .multipliedBy(newAmountCLPBU)
      .div(pairBalanceCLPBU)
      .integerValue(BigNumber.ROUND_FLOOR);
    const newAmountUNI = toTokenUnitsBN(newAmountUNIBU, UNI.decimals);
    setAmountUNI(newAmountUNI);
  };

  const onChangeAmountCLP = (amountCLP) => {
    if (!amountCLP) {
      setAmountCLP(new BigNumber(0));
      setAmountUSDC(new BigNumber(0));
      setAmountUNI(new BigNumber(0));
      return;
    }

    const amountCLPBN = new BigNumber(amountCLP);
    setAmountCLP(amountCLPBN);

    const amountCLPBU = toBaseUnitBN(amountCLPBN, CLP.decimals);
    const newAmountUSDC = toTokenUnitsBN(
      amountCLPBU
        .multipliedBy(USDCToCLPRatio)
        .integerValue(BigNumber.ROUND_FLOOR),
      CLP.decimals
    );
    setAmountUSDC(newAmountUSDC);

    const newAmountUSDCBU = toBaseUnitBN(newAmountUSDC, USDC.decimals);
    const pairTotalSupplyBU = toBaseUnitBN(pairTotalSupplyUNI, UNI.decimals);
    const pairBalanceUSDCBU = toBaseUnitBN(pairBalanceUSDC, USDC.decimals);
    const newAmountUNIBU = pairTotalSupplyBU
      .multipliedBy(newAmountUSDCBU)
      .div(pairBalanceUSDCBU)
      .integerValue(BigNumber.ROUND_FLOOR);
    const newAmountUNI = toTokenUnitsBN(newAmountUNIBU, UNI.decimals);
    setAmountUNI(newAmountUNI);
  };

  return (
    <Container>
      <div>
        {/* Pool Status */}
        <div>
          <BalanceBlock asset="USDC Balance" balance={userBalanceUSDC} />
        </div>
        {/* Add liquidity to pool */}
        <div>
          <div>
            <div>
              <>
                <BigNumberInput
                  adornment="CLP"
                  value={amountCLP}
                  setter={onChangeAmountCLP}
                />
                <MaxButton
                  onClick={() => {
                    onChangeAmountCLP(userBalanceCLP);
                  }}
                />
              </>
            </div>
            <div>
              <BigNumberInput
                adornment="USDC"
                value={amountUSDC}
                setter={onChangeAmountUSDC}
              />
              <PriceSection
                label="Mint "
                amt={amountUNI}
                symbol=" Pool Tokens"
              />
            </div>
            <div>
              <Button
                title="Add Liquidity"
                onButtonClick={() => {
                  const amountCLPBU = toBaseUnitBN(amountCLP, CLP.decimals);
                  const amountUSDCBU = toBaseUnitBN(amountUSDC, USDC.decimals);
                  addLiquidity(amountCLPBU, amountUSDCBU, SLIPPAGE);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default AddLiquidity;

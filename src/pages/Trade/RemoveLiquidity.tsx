import React, { useState } from "react";
import BigNumber from "bignumber.js";
import { removeLiquidity } from "../../utils/web3";

import { toBaseUnitBN } from "../../utils/number";
import { decreaseWithSlippage } from "../../utils/calculation";
import { CLP, UNI, USDC } from "../../constants/tokens";

//Components
import Container from "../../components/Container";
import Button from "../../components/Button";
import BalanceBlock from "../../components/BalanceBlock";
import PriceSection from "../../components/PriceSection";
import MaxButton from "../../components/MaxButton";
import BigNumberInput from "../../components/BigNumInput";

type RemoveLiquidityProps = {
  userBalanceUNI: BigNumber;
  pairBalanceCLP: BigNumber;
  pairBalanceUSDC: BigNumber;
  pairTotalSupplyUNI: BigNumber;
};

function RemoveLiquidity({
  userBalanceUNI,
  pairBalanceCLP,
  pairBalanceUSDC,
  pairTotalSupplyUNI,
}: RemoveLiquidityProps) {
  const [withdrawAmountUNI, setWithdrawAmountUNI] = useState(new BigNumber(0));

  const poolPortion = withdrawAmountUNI.div(pairTotalSupplyUNI);
  const estimatedUSDCReceived = pairBalanceUSDC.times(poolPortion);
  const estimatedCLPReceived = pairBalanceCLP.times(poolPortion);

  const minUSDCReceived = decreaseWithSlippage(estimatedUSDCReceived);
  const minCLPReceived = decreaseWithSlippage(estimatedCLPReceived);

  const onChangeWithdrawAmountUNI = (amountUNI) => {
    if (!amountUNI) {
      setWithdrawAmountUNI(new BigNumber(0));
      return;
    }
    const amountUNIBN = new BigNumber(amountUNI);
    setWithdrawAmountUNI(amountUNIBN);
  };

  return (
    <Container>
      <div>
        {/* Pool Token in Hold */}
        <div>
          <BalanceBlock asset="Pair Token Balance" balance={userBalanceUNI} />
        </div>
        {/* Remove */}
        <div>
          <div>
            <div>
              <BigNumberInput
                adornment="UNI-V2"
                value={withdrawAmountUNI}
                setter={onChangeWithdrawAmountUNI}
              />
              <MaxButton onClick={() => setWithdrawAmountUNI(userBalanceUNI)} />
            </div>
            <div>
              <>
                <PriceSection
                  label="You get "
                  amt={estimatedUSDCReceived}
                  symbol=" USDC"
                />
                <PriceSection
                  label="+ "
                  amt={estimatedCLPReceived}
                  symbol=" CLP"
                />
              </>
            </div>
            <div>
              <Button
                title="Remove Liquidity"
                onButtonClick={() => {
                  removeLiquidity(
                    toBaseUnitBN(withdrawAmountUNI, UNI.decimals),
                    toBaseUnitBN(minCLPReceived, CLP.decimals),
                    toBaseUnitBN(minUSDCReceived, USDC.decimals)
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

export default RemoveLiquidity;

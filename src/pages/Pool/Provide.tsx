import React, { useState } from "react";
import BigNumber from "bignumber.js";
import { approve, providePool } from "../../utils/web3";
import { isPos, toBaseUnitBN, toTokenUnitsBN } from "../../utils/number";
import { CLP, USDC } from "../../constants/tokens";
import { MAX_UINT256 } from "../../constants/values";

//Components
import BigNumberInput from "../../components/BigNumInput";
import BalanceBlock from "../../components/BalanceBlock";
import MaxButton from "../../components/MaxButton";
import PriceSection from "../../components/PriceSection";
import Button from "../../components/Button";

//Style
import "./style.css";

type ProvideProps = {
  poolAddress: string;
  user: string;
  rewarded: BigNumber;
  pairBalanceCLP: BigNumber;
  pairBalanceUSDC: BigNumber;
  userUSDCBalance: BigNumber;
  userUSDCAllowance: BigNumber;
  status: number;
};

function Provide({
  poolAddress,
  user,
  rewarded,
  pairBalanceCLP,
  pairBalanceUSDC,
  userUSDCBalance,
  userUSDCAllowance,
  status,
}: ProvideProps) {
  const [provideAmount, setProvideAmount] = useState(new BigNumber(0));
  const [usdcAmount, setUsdcAmount] = useState(new BigNumber(0));

  const USDCToCLPRatio = pairBalanceUSDC.isZero()
    ? new BigNumber(1)
    : pairBalanceUSDC.div(pairBalanceCLP);

  const onChangeAmountCLP = (amountCLP) => {
    if (!amountCLP) {
      setProvideAmount(new BigNumber(0));
      setUsdcAmount(new BigNumber(0));
      return;
    }

    const amountCLPBN = new BigNumber(amountCLP);
    setProvideAmount(amountCLPBN);

    const amountCLPBU = toBaseUnitBN(amountCLPBN, CLP.decimals);
    const newAmountUSDC = toTokenUnitsBN(
      amountCLPBU
        .multipliedBy(USDCToCLPRatio)
        .integerValue(BigNumber.ROUND_FLOOR),
      CLP.decimals
    );
    setUsdcAmount(newAmountUSDC);
  };

  return (
    <div className="Provide">
      {userUSDCAllowance.comparedTo(MAX_UINT256.dividedBy(2)) > 0 ? (
        <ul>
          {/* total rewarded */}
          <li>
            <BalanceBlock asset="Rewarded" balance={rewarded} suffix={"CLP"} />
          </li>
          <li>
            <BalanceBlock
              asset="USDC Balance"
              balance={userUSDCBalance}
              suffix={"USDC"}
            />
          </li>
          {/* Provide liquidity using Pool rewards */}
          <div>
            <div>
              <li>
                <BigNumberInput
                  adornment="CLP"
                  value={provideAmount}
                  setter={onChangeAmountCLP}
                  disabled={status === 1}
                />
                <PriceSection
                  label="Requires "
                  amt={usdcAmount}
                  symbol=" USDC"
                />
                <MaxButton
                  onClick={() => {
                    onChangeAmountCLP(rewarded);
                  }}
                />
              </li>
              <li>
                <Button
                  className="wide"
                  title="Provide"
                  onButtonClick={() => {
                    providePool(
                      poolAddress,
                      toBaseUnitBN(provideAmount, CLP.decimals),
                      (hash) => setProvideAmount(new BigNumber(0))
                    );
                  }}
                  disabled={
                    poolAddress === "" ||
                    status !== 0 ||
                    !isPos(provideAmount) ||
                    usdcAmount.isGreaterThan(userUSDCBalance)
                  }
                />
              </li>
            </div>
          </div>
        </ul>
      ) : (
        <ul>
          {/* total rewarded */}
          <li>
            <BalanceBlock asset="Rewarded" balance={rewarded} suffix={"CLP"} />
          </li>
          <li>
            <BalanceBlock
              asset="USDC Balance"
              balance={userUSDCBalance}
              suffix={"USDC"}
            />
          </li>
          {/* Approve Pool to spend USDC */}
          <li>
            <Button
              className="wide"
              title="+ Approve"
              onButtonClick={() => {
                approve(USDC.addr, poolAddress);
              }}
              disabled={poolAddress === "" || user === ""}
            />
          </li>
        </ul>
      )}

      <span>Zap your rewards directly to LP by providing more USDC</span>
    </div>
  );
}

export default Provide;

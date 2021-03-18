import React, { useState } from "react";

import BigNumber from "bignumber.js";
import { approve, purchaseCoupons } from "../../utils/web3";

import { isPos, toBaseUnitBN, toTokenUnitsBN } from "../../utils/number";
import { CLP, CLPS } from "../../constants/tokens";
import { MAX_UINT256 } from "../../constants/values";
import { getCouponPremium } from "../../utils/infura";

//Components
import TableCell from "../../components/TableCell";
import Button from "../../components/Button";
import BalanceBlock from "../../components/BalanceBlock";
import PriceSection from "../../components/PriceSection";
import MaxButton from "../../components/MaxButton";
import BigNumberInput from "../../components/BigNumInput";

type PurchaseCouponsProps = {
  user: string;
  allowance: BigNumber;
  balance: BigNumber;
  debt: BigNumber;
};

function PurchaseCoupons({
  user,
  balance,
  allowance,
  debt,
}: PurchaseCouponsProps) {
  const [purchaseAmount, setPurchaseAmount] = useState(new BigNumber(0));
  const [premium, setPremium] = useState(new BigNumber(0));

  const updatePremium = async (purchaseAmount) => {
    if (purchaseAmount.lte(new BigNumber(0))) {
      setPremium(new BigNumber(0));
      return;
    }
    const purchaseAmountBase = toBaseUnitBN(purchaseAmount, CLP.decimals);
    const premium = await getCouponPremium(CLPS.addr, purchaseAmountBase);
    const premiumFormatted = toTokenUnitsBN(premium, CLP.decimals);
    setPremium(premiumFormatted);
  };

  return (
    <TableCell>
      {allowance.comparedTo(MAX_UINT256) === 0 ? (
        <div className="PurchaseCoupons">
          <BalanceBlock asset={`Balance`} balance={balance} suffix={" CLP"} />

          <BigNumberInput
            adornment="CLP"
            value={purchaseAmount}
            setter={(value) => {
              setPurchaseAmount(value);
              isPos(value)
                ? updatePremium(value)
                : updatePremium(new BigNumber(0));
            }}
          />
          <MaxButton
            onClick={() => {
              const maxPurchaseAmount =
                debt.comparedTo(balance) > 0 ? balance : debt;
              setPurchaseAmount(maxPurchaseAmount);
              updatePremium(maxPurchaseAmount);
            }}
          />

          <Button
            className="wide"
            title="Burn"
            onButtonClick={() => {
              purchaseCoupons(
                CLPS.addr,
                toBaseUnitBN(purchaseAmount, CLP.decimals)
              );
            }}
            disabled={
              user === "" ||
              debt.isZero() ||
              balance.isZero() ||
              !isPos(purchaseAmount)
            }
          />

          <PriceSection label="Coupons " amt={purchaseAmount.plus(premium)} />
        </div>
      ) : (
        <div className="PurchaseCoupons">
          <BalanceBlock asset={`Døllar Balance`} balance={balance} />

          <Button
            className="wide"
            title="+ Approve"
            onButtonClick={() => {
              approve(CLP.addr, CLPS.addr);
            }}
            disabled={user === ""}
          />
        </div>
      )}
    </TableCell>
  );
}

export default PurchaseCoupons;

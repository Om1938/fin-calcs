// src/hooks/useEMICalculation.ts (Modified)
import { useState } from "react";
import {
  compareWithAndWithoutExtraPayments,
  EMICalculationInput,
} from "@/lib/emi";
import {
  computePrecomputedChartData,
  PrecomputedChartData,
} from "@/lib/chartData";

export function useEMICalculation() {
  const [result, setResult] = useState<ReturnType<
    typeof compareWithAndWithoutExtraPayments
  > | null>(null);
  const [chartData, setChartData] = useState<PrecomputedChartData | null>(null);
  const [isComparison, setIsComparison] = useState<boolean>(false);

  const calculate = (input: EMICalculationInput) => {
    try {
      const hasExtra = input.extraPayments && input.extraPayments.length > 0;
      setIsComparison(hasExtra!);
      const computed = compareWithAndWithoutExtraPayments(input);
      setResult(computed);
      const precomputedData = computePrecomputedChartData(computed);
      setChartData(precomputedData);
    } catch (error) {
      console.error("Error during EMI calculation:", error);
      setResult(null);
      setChartData(null);
    }
  };

  return { result, chartData, calculate, isComparison };
}

/**
 * EMI Calculation Library
 * Provides types and functions for calculating EMI schedules
 */

export type PrepaymentImpact = "reduce_emi" | "reduce_tenure";

export type ExtraPayment = {
  monthIndex: number; // 0-based index (month 0 = first month)
  amount: number;
  impact: PrepaymentImpact;
  isRecurring?: boolean;
  every?: number;
};

export type EMICalculationInput = {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  extraPayments?: ExtraPayment[];
};

export type EMIMonth = {
  month: number;
  principalComponent: number;
  interestComponent: number;
  totalPayment: number;
  balance: number;
  type: "emi" | "extra";
  tag?: "Recurring" | "One-time";
};

export type EMIResult = {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: EMIMonth[];
};

const MAX_ITERATIONS = 1000;
const TOLERANCE = 0.5;

/**
 * Computes the standard EMI using the EMI formula.
 * @param principal The principal amount.
 * @param rate The monthly interest rate.
 * @param months The number of months.
 * @returns The computed EMI.
 */
function computeEMI(principal: number, rate: number, months: number): number {
  if (months <= 0) return 0;
  if (rate === 0) {
    // When interest rate is zero, spread the principal evenly.
    return principal / months;
  }
  return (
    (principal * rate * Math.pow(1 + rate, months)) /
    (Math.pow(1 + rate, months) - 1)
  );
}

/**
 * calculateEMI
 * -----------
 * Calculates the EMI schedule, total interest, and total payment.
 * Extra payments are processed as per the provided input.
 * @param input Calculation input details.
 * @returns EMIResult containing EMI, totals, and the payment schedule.
 */
export function calculateEMI(input: EMICalculationInput): EMIResult {
  const { principal, annualRate, tenureMonths, extraPayments = [] } = input;
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const remainingTenure = tenureMonths;
  let emi = computeEMI(balance, monthlyRate, remainingTenure);

  const schedule: EMIMonth[] = [];
  let totalInterest = 0;
  let month = 0;

  // Loop until the loan is almost repaid or until MAX_ITERATIONS is reached.
  while (balance > TOLERANCE && month < MAX_ITERATIONS) {
    const interest = balance * monthlyRate;
    const principalComponent = Math.min(emi - interest, balance);
    const totalPayment = principalComponent + interest;
    balance -= principalComponent;
    totalInterest += interest;

    schedule.push({
      month: month + 1, // Convert 0-based to 1-based display.
      principalComponent,
      interestComponent: interest,
      totalPayment,
      balance: Math.max(balance, 0),
      type: "emi",
    });

    // Process any extra (pre)payments for this month.
    for (const extra of extraPayments) {
      const isThisMonth =
        extra.monthIndex === month ||
        (extra.isRecurring &&
          extra.every !== undefined &&
          month >= extra.monthIndex &&
          (month - extra.monthIndex) % extra.every === 0);

      if (isThisMonth && balance > 0) {
        const paymentAmount = Math.min(balance, extra.amount);
        balance = Math.max(0, balance - paymentAmount);

        schedule.push({
          month: month + 1,
          principalComponent: paymentAmount,
          interestComponent: 0,
          totalPayment: paymentAmount,
          balance,
          type: "extra",
          tag: extra.isRecurring ? "Recurring" : "One-time",
        });

        // Recompute EMI if the extra payment is meant to reduce the EMI.
        if (extra.impact === "reduce_emi" && balance > 0) {
          const remainingMonths = remainingTenure - (month + 1);
          emi = computeEMI(balance, monthlyRate, remainingMonths);
        }
      }
    }

    month++;
  }

  return {
    emi,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

/**
 * compareWithAndWithoutExtraPayments
 * ----------------------------------
 * Returns EMI results for two scenarios:
 * 1. With extra payments.
 * 2. Without extra payments.
 * @param input Calculation input details.
 * @returns An object containing both EMI results.
 */
export function compareWithAndWithoutExtraPayments(
  input: EMICalculationInput
): { withExtra: EMIResult; withoutExtra: EMIResult } {
  const withExtra = calculateEMI(input);
  const withoutExtra = calculateEMI({ ...input, extraPayments: [] });
  return { withExtra, withoutExtra };
}

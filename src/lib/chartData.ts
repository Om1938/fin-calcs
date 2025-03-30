import { EMIResult, EMIMonth } from "@/lib/emi";

export type PrecomputedChartData = {
  cumulativeData: {
    month: string;
    withExtraCumulativePrincipal: number | null;
    withExtraCumulativeInterest: number | null;
    withExtraBalance: number | null;
    withoutExtraCumulativePrincipal: number | null;
    withoutExtraCumulativeInterest: number | null;
    withoutExtraBalance: number | null;
  }[];
  barData: {
    month: string;
    numericMonth: number;
    principal: number;
    interest: number;
  }[];
  extraBarData: {
    month: string;
    numericMonth: number;
    principal: number;
    interest: number;
  }[];
  allBarMonths: {
    month: string;
    withoutPrincipal: number;
    withoutInterest: number;
    withPrincipal: number;
    withInterest: number;
  }[];
  withExtraOutflows: {
    month: string;
    total: number;
  }[];
  withoutExtraOutflows: {
    month: string;
    total: number;
  }[];
  donutData: {
    name: string;
    interest: number;
    principal: number;
  }[];
  axesLimits: {
    principalMax: number;
    interestMax: number;
    balanceMax: number;
    barMax: number;
    outflowMax: number;
  };
};

/* ---------- Helper functions ---------- */

function getMonthlyAggregates(schedule: EMIMonth[]) {
  const monthlyMap = new Map<
    number,
    { principal: number; interest: number; balance: number }
  >();

  for (const row of schedule) {
    const m = row.month;
    if (!monthlyMap.has(m)) {
      monthlyMap.set(m, { principal: 0, interest: 0, balance: 0 });
    }
    const monthData = monthlyMap.get(m)!;
    monthData.principal += row.principalComponent;
    monthData.interest += row.interestComponent;
    monthData.balance = row.balance;
  }

  const sortedMonths = Array.from(monthlyMap.keys()).sort((a, b) => a - b);
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  return sortedMonths.map((monthNum) => {
    const { principal, interest, balance } = monthlyMap.get(monthNum)!;
    cumulativePrincipal += principal;
    cumulativeInterest += interest;
    return {
      month: monthNum,
      cumulativePrincipal,
      cumulativeInterest,
      balance,
    };
  });
}

function getPaymentBars(schedule: EMIMonth[]) {
  const monthMap = new Map<number, { principal: number; interest: number }>();
  for (const row of schedule) {
    const m = row.month;
    if (!monthMap.has(m)) {
      monthMap.set(m, { principal: 0, interest: 0 });
    }
    const entry = monthMap.get(m)!;
    entry.principal += row.principalComponent;
    entry.interest += row.interestComponent;
  }
  return Array.from(monthMap.entries()).map(([month, values]) => ({
    month: `M${month}`,
    numericMonth: month,
    principal: values.principal,
    interest: values.interest,
  }));
}

function getMonthlyOutflows(schedule: EMIMonth[]) {
  const monthMap = new Map<number, number>();
  for (const row of schedule) {
    const m = row.month;
    if (!monthMap.has(m)) monthMap.set(m, 0);
    monthMap.set(m, monthMap.get(m)! + row.totalPayment);
  }
  return Array.from(monthMap.entries()).map(([month, total]) => ({
    month: `M${month}`,
    total,
  }));
}

/* ---------- Main Precomputation Function ---------- */

export function computePrecomputedChartData(result: {
  withExtra: EMIResult;
  withoutExtra: EMIResult;
}): PrecomputedChartData {
  const weAgg = getMonthlyAggregates(result.withExtra.schedule);
  const woAgg = getMonthlyAggregates(result.withoutExtra.schedule);

  const lastMonth = Math.max(
    weAgg.length > 0 ? weAgg[weAgg.length - 1].month : 0,
    woAgg.length > 0 ? woAgg[woAgg.length - 1].month : 0
  );

  const cumulativeData = [];
  for (let m = 1; m <= lastMonth; m++) {
    const weRow = weAgg.find((r) => r.month === m);
    const woRow = woAgg.find((r) => r.month === m);
    cumulativeData.push({
      month: `M${m}`,
      withExtraCumulativePrincipal: weRow?.cumulativePrincipal ?? null,
      withExtraCumulativeInterest: weRow?.cumulativeInterest ?? null,
      withExtraBalance: weRow?.balance ?? null,
      withoutExtraCumulativePrincipal: woRow?.cumulativePrincipal ?? null,
      withoutExtraCumulativeInterest: woRow?.cumulativeInterest ?? null,
      withoutExtraBalance: woRow?.balance ?? null,
    });
  }

  const barData = getPaymentBars(result.withoutExtra.schedule);
  const extraBarData = getPaymentBars(result.withExtra.schedule);

  const maxBarMonth = Math.max(
    barData.length > 0 ? barData[barData.length - 1].numericMonth : 0,
    extraBarData.length > 0
      ? extraBarData[extraBarData.length - 1].numericMonth
      : 0
  );
  const allBarMonths = Array.from({ length: maxBarMonth }, (_, i) => {
    const month = i + 1;
    const base = { month: `M${month}` };
    const wo = barData.find((b) => b.numericMonth === month);
    const we = extraBarData.find((b) => b.numericMonth === month);
    return {
      ...base,
      withoutPrincipal: wo?.principal ?? 0,
      withoutInterest: wo?.interest ?? 0,
      withPrincipal: we?.principal ?? 0,
      withInterest: we?.interest ?? 0,
    };
  });

  const principalMax = Math.floor(
    Math.max(
      ...cumulativeData.map((d) =>
        Math.max(
          d.withExtraCumulativePrincipal ?? 0,
          d.withoutExtraCumulativePrincipal ?? 0
        )
      )
    ) * 1.1
  );
  const interestMax = Math.floor(
    Math.max(
      ...cumulativeData.map((d) =>
        Math.max(
          d.withExtraCumulativeInterest ?? 0,
          d.withoutExtraCumulativeInterest ?? 0
        )
      )
    ) * 1.1
  );
  const balanceMax = Math.floor(
    Math.max(
      ...cumulativeData.map((d) =>
        Math.max(d.withExtraBalance ?? 0, d.withoutExtraBalance ?? 0)
      )
    ) * 1.1
  );
  const barMax = Math.floor(
    Math.max(
      ...barData.map((d) => d.principal + d.interest),
      ...extraBarData.map((d) => d.principal + d.interest)
    ) * 1.1
  );
  const withExtraOutflows = getMonthlyOutflows(result.withExtra.schedule);
  const withoutExtraOutflows = getMonthlyOutflows(result.withoutExtra.schedule);
  const outflowMax = Math.floor(
    Math.max(
      ...withExtraOutflows.map((d) => d.total),
      ...withoutExtraOutflows.map((d) => d.total)
    ) * 1.1
  );
  const donutData = [
    {
      name: "With Extra",
      interest: result.withExtra.totalInterest,
      principal: result.withExtra.totalPayment - result.withExtra.totalInterest,
    },
    {
      name: "Without Extra",
      interest: result.withoutExtra.totalInterest,
      principal:
        result.withoutExtra.totalPayment - result.withoutExtra.totalInterest,
    },
  ];

  return {
    cumulativeData,
    barData,
    extraBarData,
    allBarMonths,
    withExtraOutflows,
    withoutExtraOutflows,
    donutData,
    axesLimits: { principalMax, interestMax, balanceMax, barMax, outflowMax },
  };
}

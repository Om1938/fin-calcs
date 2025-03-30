import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { EMIResult } from "@/lib/emi";
import { PrecomputedChartData } from "@/lib/chartData";

interface EMIChartProps {
  withExtra: EMIResult;
  withoutExtra: EMIResult;
  precomputedData: PrecomputedChartData;
}

const COLORS = ["#10b981", "#f43f5e"];

export const EMIChart: React.FC<EMIChartProps> = ({ precomputedData }) => {
  const {
    cumulativeData,
    barData,
    allBarMonths,
    withExtraOutflows,
    withoutExtraOutflows,
    donutData,
    axesLimits,
  } = precomputedData;

  return (
    <div className="space-y-6">
      {/* Chart 1: Cumulative Principal */}
      <div className="w-full h-[300px]">
        <h3 className="text-lg font-semibold mb-2">
          Cumulative Principal Paid
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumulativeData} syncId="emi-sync">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, axesLimits.principalMax]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="withExtraCumulativePrincipal"
              name="With Extra"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="withoutExtraCumulativePrincipal"
              name="Without Extra"
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Cumulative Interest */}
      <div className="w-full h-[300px]">
        <h3 className="text-lg font-semibold mb-2">Cumulative Interest Paid</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumulativeData} syncId="emi-sync">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, axesLimits.interestMax]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="withExtraCumulativeInterest"
              name="With Extra"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="withoutExtraCumulativeInterest"
              name="Without Extra"
              stroke="#ea580c"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Outstanding Balance */}
      <div className="w-full h-[300px]">
        <h3 className="text-lg font-semibold mb-2">Outstanding Balance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cumulativeData} syncId="emi-sync">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, axesLimits.balanceMax]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="withExtraBalance"
              name="With Extra"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="withoutExtraBalance"
              name="Without Extra"
              stroke="#a21caf"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 4: Monthly Payment Split (Without Extra) */}
      <div className="w-full h-[300px]">
        <h3 className="text-lg font-semibold mb-2">
          Monthly Payment Split (Without Extra)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} syncId="emi-sync">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, axesLimits.barMax]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="principal" name="Toward Loan" fill="#10b981" />
            <Bar dataKey="interest" name="Toward Interest" fill="#f43f5e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 5: Monthly Payment Split (With Extra) */}
      <div className="w-full h-[300px]">
        <h3 className="text-lg font-semibold mb-2">
          Monthly Payment Split (With Extra)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allBarMonths} syncId="emi-sync">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, axesLimits.barMax]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="withPrincipal" name="Toward Loan" fill="#10b981" />
            <Bar dataKey="withInterest" name="Toward Interest" fill="#f43f5e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 6: Total Monthly Outflow */}
      <div className="w-full h-[300px]">
        <h3 className="text-lg font-semibold mb-2">
          Total Monthly Outflow (EMI + Extra)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              type="category"
              allowDuplicatedCategory={false}
            />
            <YAxis domain={[0, axesLimits.outflowMax]} />
            <Tooltip />
            <Legend />
            <Line
              data={withoutExtraOutflows}
              type="monotone"
              dataKey="total"
              name="Without Extra"
              stroke="#f43f5e"
              dot={false}
            />
            <Line
              data={withExtraOutflows}
              type="monotone"
              dataKey="total"
              name="With Extra"
              stroke="#10b981"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 7: Donut Comparison */}
      <h3 className="text-lg font-semibold mb-2">
        Donut Comparison of Interest vs Principal
      </h3>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {donutData.map((d) => (
          <div key={d.name} className="h-[300px]">
            <h3 className="text-lg font-semibold mb-2">{d.name}</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: "Principal", value: d.principal },
                    { name: "Interest", value: d.interest },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

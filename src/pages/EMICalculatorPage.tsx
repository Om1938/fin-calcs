import React from "react";
import { EMIForm } from "@/components/EMIForm";
import { EMIChart } from "@/components/EMIChart";
import { EMISummary } from "@/components/EMISummary";
import { AmortizationTable } from "@/components/AmortizationTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEMICalculation } from "@/hooks/useEMICalculation";

const EMICalculatorPage: React.FC = () => {
  const { result, chartData, calculate } = useEMICalculation();
  console.log(result);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold">EMI Calculator</h1>
        <EMIForm onCalculate={calculate} />
      </div>

      <div className="flex-1 p-2">
        {result && chartData && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EMISummary
                  result={result.withExtra}
                  label="With Extra Payments"
                />
                <EMISummary
                  result={result.withoutExtra}
                  label="Without Extra Payments"
                />
              </div>
            </TabsContent>

            <TabsContent
              value="chart"
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <EMIChart
                withExtra={result.withExtra}
                withoutExtra={result.withoutExtra}
                precomputedData={chartData}
              />
            </TabsContent>

            <TabsContent value="table">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[900px] overflow-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <AmortizationTable
                  schedule={result.withExtra.schedule}
                  title="With Extra Payments"
                />
                <AmortizationTable
                  schedule={result.withoutExtra.schedule}
                  title="Without Extra Payments"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default EMICalculatorPage;

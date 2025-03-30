import React from "react";
import { EMIResult } from "@/lib/emi";

interface AmortizationTableProps {
  schedule: EMIResult["schedule"];
  title?: string;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  schedule,
  title,
}) => {
  return (
    <div className="mt-4 border rounded-md min-w-[400px] max-w-[600px] overflow-hidden shadow-md">
      {title && <h4 className="font-semibold p-2">{title}</h4>}
      <table className="w-full text-sm">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="text-left p-2">Month</th>
            <th className="text-left p-2">Principal</th>
            <th className="text-left p-2">Interest</th>
            <th className="text-left p-2">Total Payment</th>
            <th className="text-left p-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => {
            const isExtraPayment =
              row.interestComponent === 0 && row.totalPayment > 0;
            return (
              <tr
                key={`${row.month}-${idx}`}
                className={`border-t ${
                  isExtraPayment ? "bg-green-50 font-medium text-green-900" : ""
                }`}
              >
                <td className="p-2">{row.month}</td>
                <td className="p-2">₹{row.principalComponent.toFixed(2)}</td>
                <td className="p-2">₹{row.interestComponent.toFixed(2)}</td>
                <td className="p-2">₹{row.totalPayment.toFixed(2)}</td>
                <td className="p-2">₹{row.balance.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

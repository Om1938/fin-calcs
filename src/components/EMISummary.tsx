import React from "react";
import { EMIResult } from "@/lib/emi";

interface EMISummaryProps {
  result: EMIResult;
  label: string;
}

export const EMISummary: React.FC<EMISummaryProps> = ({ result, label }) => {
  const { emi, totalInterest, totalPayment, schedule } = result;

  return (
    <div className="border rounded-2xl p-4 shadow-md bg-white space-y-2">
      <h4 className="font-semibold text-lg mb-2">{label}</h4>
      <div className="grid grid-cols-2 gap-y-1 text-sm">
        <span className="text-muted-foreground">EMI:</span>
        <span>₹{emi.toFixed(2)}</span>
        <span className="text-muted-foreground">Total Interest:</span>
        <span>₹{totalInterest.toFixed(2)}</span>
        <span className="text-muted-foreground">Total Payment:</span>
        <span>₹{totalPayment.toFixed(2)}</span>
        <span className="text-muted-foreground">Tenure:</span>
        <span>{schedule.filter((s) => s.type === "emi").length} months</span>
      </div>
    </div>
  );
};

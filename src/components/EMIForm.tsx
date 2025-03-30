import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { EMICalculationInput } from "@/lib/emi";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";

const extraPaymentSchema = z
  .object({
    monthIndex: z.number().min(1, "Month must be >= 1").optional(),
    amount: z.number().positive("Amount must be > 0").optional(),
    impact: z.enum(["reduce_emi", "reduce_tenure"]),
    isRecurring: z.boolean().optional().default(false),
    every: z.preprocess((val) => {
      if (val === "" || val === undefined) return undefined;
      const parsed = Number(val);
      return Number.isNaN(parsed) ? undefined : parsed;
    }, z.number().min(1).optional()),
  })
  .superRefine((data, ctx) => {
    if (data.monthIndex === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthIndex"],
        message: "Month is required",
      });
    }
    if (data.isRecurring) {
      if (data.every === undefined || data.every < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["every"],
          message:
            "Enter a valid recurring interval (>=1) when 'Recurring' is checked.",
        });
      }
    }
  });

const formSchema = z.object({
  principal: z.number().min(1, "Loan amount must be at least 1"),
  annualRate: z.number(),
  tenureMonths: z.number().min(1, "Tenure must be at least 1 month"),
  extraPayments: z.array(extraPaymentSchema).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface EMIFormProps {
  onCalculate: (input: EMICalculationInput) => void;
}

export const EMIForm: React.FC<EMIFormProps> = ({ onCalculate }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: 6000000,
      annualRate: 6,
      tenureMonths: 360,
      extraPayments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extraPayments",
  });
  const watchExtraPayments = watch("extraPayments") || [];
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (fields.length > 0) {
      setOpenItem(fields[fields.length - 1].id);
    } else {
      setOpenItem(null);
    }
  }, [fields]);

  const onSubmit = (data: FormValues) => {
    // Adjust monthIndex for 0-based indexing used in calculations.
    const adjustedData = {
      ...data,
      extraPayments: data.extraPayments?.map((ep) => ({
        ...ep,
        monthIndex:
          ep.monthIndex !== undefined ? ep.monthIndex - 1 : ep.monthIndex,
      })),
    };
    // @ts-expect-error This is okay
    onCalculate(adjustedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Loan Details */}
      <div className="space-y-4">
        <div>
          <Label>Loan Amount</Label>
          <Input
            type="number"
            placeholder="Loan Amount"
            {...register("principal", { valueAsNumber: true })}
          />
          {errors.principal && (
            <p className="text-red-500 text-sm mt-1">
              {errors.principal.message}
            </p>
          )}
        </div>
        <div>
          <Label>Annual Interest Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="Annual Interest (%)"
            {...register("annualRate", { valueAsNumber: true })}
          />
          {errors.annualRate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.annualRate.message}
            </p>
          )}
        </div>
        <div>
          <Label>Tenure (months)</Label>
          <Input
            type="number"
            placeholder="Tenure (months)"
            {...register("tenureMonths", { valueAsNumber: true })}
          />
          {errors.tenureMonths && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tenureMonths.message}
            </p>
          )}
        </div>
      </div>

      {/* Extra Payments Section */}
      <div>
        <Label className="text-lg mb-2 block">Extra Payments</Label>
        <Accordion
          type="single"
          collapsible
          value={openItem!}
          onValueChange={setOpenItem}
        >
          {fields.map((field, index) => {
            const current = watchExtraPayments[index];
            const errorAtIndex = errors.extraPayments?.[index];

            const summaryParts: string[] = [];
            if (current) {
              if (current.amount !== undefined)
                summaryParts.push(`Rs ${current.amount}`);
              if (current.monthIndex !== undefined)
                summaryParts.push(`at Month ${current.monthIndex}`);
              if (current.isRecurring && current.every)
                summaryParts.push(`(Recurring every ${current.every} mo.)`);
              else if (current.isRecurring) summaryParts.push(`(Recurring)`);
            }
            const summary =
              summaryParts.join(" ") || `Extra Payment #${index + 1}`;

            return (
              <AccordionItem key={field.id} value={field.id}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full">
                    <span>{summary}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(index);
                      }}
                      className="ml-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 border p-3 rounded-md mt-2">
                    <div>
                      <Label>Month</Label>
                      <Input
                        type="number"
                        placeholder="Month #"
                        {...register(`extraPayments.${index}.monthIndex`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errorAtIndex?.monthIndex && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorAtIndex.monthIndex.message as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        placeholder="Extra Payment Amount"
                        {...register(`extraPayments.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errorAtIndex?.amount && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorAtIndex.amount.message as string}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Impact</Label>
                      <Select
                        defaultValue={field.impact || "reduce_tenure"}
                        onValueChange={(val) =>
                          setValue(
                            `extraPayments.${index}.impact`,
                            val as "reduce_emi" | "reduce_tenure"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Impact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reduce_emi">Reduce EMI</SelectItem>
                          <SelectItem value="reduce_tenure">
                            Reduce Tenure
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={!!current?.isRecurring}
                        onCheckedChange={(checked) =>
                          setValue(
                            `extraPayments.${index}.isRecurring`,
                            !!checked
                          )
                        }
                      />
                      <Label>Recurring</Label>
                      <Input
                        type="number"
                        placeholder="Every N Months"
                        disabled={!current?.isRecurring}
                        className="w-32"
                        {...register(`extraPayments.${index}.every`, {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                    {errorAtIndex?.every && (
                      <p className="text-red-500 text-sm mt-1">
                        {errorAtIndex.every.message as string}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        <Button
          type="button"
          className="mt-4"
          onClick={() =>
            append({
              monthIndex: undefined,
              amount: undefined,
              impact: "reduce_tenure",
              isRecurring: false,
              every: undefined,
            })
          }
        >
          + Add Extra Payment
        </Button>
      </div>

      <Button type="submit" className="float-end">
        Calculate EMI
      </Button>
    </form>
  );
};

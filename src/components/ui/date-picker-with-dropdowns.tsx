import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DatePickerWithDropdownsProps {
  fromYear?: number;
  toYear?: number;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  defaultMonth?: Date;
  disabled?: (date: Date) => boolean;
  className?: string;
  classNames?: Partial<Record<string, string>>;
  showOutsideDays?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function DatePickerWithDropdowns({
  className,
  classNames,
  showOutsideDays = true,
  fromYear = 1920,
  toYear = new Date().getFullYear(),
  selected,
  onSelect,
  defaultMonth,
  disabled,
}: DatePickerWithDropdownsProps) {
  const [month, setMonth] = React.useState<Date>(
    (selected as Date) || defaultMonth || new Date()
  );

  const years = React.useMemo(() => {
    const yearsArray: number[] = [];
    for (let year = toYear; year >= fromYear; year--) {
      yearsArray.push(year);
    }
    return yearsArray;
  }, [fromYear, toYear]);

  const handleMonthChange = (newMonth: string) => {
    const monthIndex = MONTHS.indexOf(newMonth);
    if (monthIndex !== -1) {
      const newDate = new Date(month);
      newDate.setMonth(monthIndex);
      setMonth(newDate);
    }
  };

  const handleYearChange = (newYear: string) => {
    const year = parseInt(newYear, 10);
    if (!isNaN(year)) {
      const newDate = new Date(month);
      newDate.setFullYear(year);
      setMonth(newDate);
    }
  };

  const handlePrevMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);
    setMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);
    setMonth(newDate);
  };

  return (
    <div className={cn("p-3 pointer-events-auto", className)}>
      {/* Custom Caption with Dropdowns */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <Select
            value={MONTHS[month.getMonth()]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-[110px] text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto bg-popover">
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={month.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[80px] text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto bg-popover">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day Picker without its own caption */}
      <DayPicker
        mode="single"
        showOutsideDays={showOutsideDays}
        month={month}
        onMonthChange={setMonth}
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden",
          caption_label: "hidden",
          nav: "hidden",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
      />
    </div>
  );
}

DatePickerWithDropdowns.displayName = "DatePickerWithDropdowns";

export { DatePickerWithDropdowns };

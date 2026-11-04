import { useRef } from "react";
import { useDayRender, type DayProps } from "react-day-picker";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

/** Preserve DayPicker's arrow-key navigation while giving every day a full Korean name. */
export function BookingCalendarDay({ date, displayMonth }: DayProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const day = useDayRender(date, displayMonth, ref);
  if (day.isHidden) return <div role="gridcell" />;
  return <button {...day.buttonProps} type="button" name="day" ref={ref}
    data-date={format(date, "yyyy-MM-dd")}
    aria-label={`${format(date, "yyyy년 M월 d일 EEEE", { locale: ko })}${day.activeModifiers.selected ? ", 선택됨" : ""}`}
  />;
}

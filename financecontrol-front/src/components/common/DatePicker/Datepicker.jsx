import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import {
  HugeiconsIcon,
  Calendar03Icon,
  ArrowDown01Icon,
} from "../../../assets/icons";
import "./DatePicker.css";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEK_DAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];

const DatePicker = forwardRef(function DatePicker(
  {
    label,
    id,
    name,
    value = "",
    onChange,
    placeholder = "Selecionar data",
    theme = "auto",
    border = true,
    shadow = true,
    fullWidth = false,
    width,
    height,
    dropdownPosition = "bottom",
    min,
    max,
    required = false,
    disabled = false,
    className = "",
  },
  ref,
) {
  const wrapperRef = useRef(null);

  const today = useMemo(() => new Date(), []);

  const parseDate = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  };

  const selectedDate = parseDate(value);

  const [isOpen, setIsOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1),
  );

  useEffect(() => {
    if (!selectedDate) return;

    setCurrentMonth(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    );
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const classNames = [
    "date-picker",
    `date-picker--${theme}`,
    `date-picker--dropdown-${dropdownPosition}`,
    border && "date-picker--bordered",
    shadow && "date-picker--shadow",
    fullWidth && "date-picker--full-width",
    isOpen && "date-picker--open",
    disabled && "date-picker--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...(width && { width }),
  };

  const isSameDate = (dateA, dateB) => {
    if (!dateA || !dateB) return false;

    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  };

  const isBeforeMin = (date) => {
    if (!min) return false;

    const minDate = parseDate(min);

    return minDate && date < minDate;
  };

  const isAfterMax = (date) => {
    if (!max) return false;

    const maxDate = parseDate(max);

    return maxDate && date > maxDate;
  };

  const isDisabledDate = (date) => {
    return isBeforeMin(date) || isAfterMax(date);
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const formatValue = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const emitChange = (date) => {
    onChange?.({
      target: {
        id,
        name,
        value: date ? formatValue(date) : "",
      },
    });
  };

  const handleSelectDate = (date) => {
    if (isDisabledDate(date)) return;

    emitChange(date);
    setIsOpen(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const handleToday = () => {
    if (isDisabledDate(today)) return;

    emitChange(today);

    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    setIsOpen(false);
  };

  const handleClear = () => {
    emitChange(null);
    setIsOpen(false);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const previousMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    for (let index = firstDayIndex - 1; index >= 0; index--) {
      days.push({
        date: new Date(year, month - 1, previousMonthDays - index),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;

    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div ref={wrapperRef} className={classNames} style={style}>
      {label && (
        <label className="date-picker__label" htmlFor={id}>
          {label}
        </label>
      )}

      <button
        ref={ref}
        type="button"
        id={id}
        className="date-picker__trigger"
        onClick={() => !disabled && setIsOpen((open) => !open)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-required={required}
      >
        <span
          className={`date-picker__value ${
            !selectedDate ? "is-placeholder" : ""
          }`}
        >
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>

        <HugeiconsIcon
          icon={Calendar03Icon}
          size={16}
          stroke="2"
          aria-hidden="true"
          className="date-picker__calendar-icon"
        />
      </button>

      {isOpen && (
        <div
          className="date-picker__dropdown"
          role="dialog"
          aria-label="Selecionar data"
        >
          <div className="date-picker__header">
            <span className="date-picker__month">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>

            <div className="date-picker__navigation">
              <button
                type="button"
                className="date-picker__navigation-button date-picker__navigation-button--previous"
                onClick={handlePreviousMonth}
                aria-label="Mês anterior"
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={16}
                  stroke="2"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="date-picker__navigation-button date-picker__navigation-button--next"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={16}
                  stroke="2"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="date-picker__weekdays">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="date-picker__calendar">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const selected = isSameDate(date, selectedDate);

              const todayDate = isSameDate(date, today);

              const disabledDate = isDisabledDate(date);

              return (
                <button
                  key={`${date.getTime()}-${index}`}
                  type="button"
                  className={[
                    "date-picker__day",
                    !isCurrentMonth && "date-picker__day--outside",
                    selected && "is-selected",
                    todayDate && "is-today",
                    disabledDate && "is-disabled",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelectDate(date)}
                  disabled={disabledDate}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="date-picker__footer">
            <button
              type="button"
              className="date-picker__footer-button"
              onClick={handleClear}
              disabled={!selectedDate}
            >
              Limpar
            </button>

            <button
              type="button"
              className="date-picker__footer-button"
              onClick={handleToday}
              disabled={isDisabledDate(today)}
            >
              Hoje
            </button>
          </div>
        </div>
      )}

      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
        readOnly
      />
    </div>
  );
});

export default DatePicker;

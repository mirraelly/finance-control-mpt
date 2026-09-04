import { forwardRef, useEffect, useRef, useState } from "react";
import { HugeiconsIcon, ArrowDown01Icon } from "../../../assets/icons";
import "./Select.css";

const Select = forwardRef(function Select(
  {
    label,
    id,
    name,
    options = [],
    placeholder = "Selecionar...",
    value,
    defaultValue = "",
    icon,
    border = true,
    shadow = true,
    theme = "auto",
    fullWidth = false,
    width,
    height,
    dropdownPosition = "bottom",
    className = "",
    onChange,
    disabled = false,
    required = false,
    ...props
  },
  ref,
) {
  const wrapperRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);

  const selectedValue = value !== undefined ? value : internalValue;

  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === selectedValue,
  );

  const displayValue = selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const classNames = [
    "select-field",
    `select-field--${theme}`,
    `select-field--dropdown-${dropdownPosition}`,
    border && "select-field--bordered",
    shadow && "select-field--shadow",
    fullWidth && "select-field--full-width",
    isOpen && "select-field--open",
    disabled && "select-field--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...(width && { width }),
    ...(height && { minHeight: height, height }),
  };

  const handleToggle = () => {
    if (disabled) return;

    setIsOpen((current) => !current);
  };

  const handleSelect = (option) => {
    if (option.disabled) return;

    const nextValue = option.value;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    setIsOpen(false);

    onChange?.({
      target: {
        name,
        value: nextValue,
        id,
      },
    });
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  const select = (
    <div ref={wrapperRef} className={classNames} style={style}>
      {icon && (
        <span className="select-field__icon" aria-hidden="true">
          {icon}
        </span>
      )}

      <button
        ref={ref}
        id={id}
        type="button"
        className="select-field__trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-required={required}
        {...props}
      >
        <span
          className={`select-field__value ${
            !selectedOption ? "is-placeholder" : ""
          }`}
        >
          {displayValue}
        </span>

        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          stroke="2"
          aria-hidden="true"
          className={`select-field__chevron ${isOpen ? "is-open" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="select-field__dropdown"
          role="listbox"
          aria-labelledby={label ? undefined : id}
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === selectedValue;

            return (
              <button
                key={option.value}
                type="button"
                className={`select-field__option ${
                  isSelected ? "is-selected" : ""
                }`}
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Mantém o valor disponível para formulários */}
      <input type="hidden" name={name} value={selectedValue} readOnly />
    </div>
  );

  if (!label) return select;

  return (
    <label className="select-field__label" htmlFor={id}>
      {label}
      {select}
    </label>
  );
});

export default Select;

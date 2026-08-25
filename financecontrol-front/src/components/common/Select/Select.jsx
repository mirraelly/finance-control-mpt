import { forwardRef } from "react";
import "./Select.css";

const Select = forwardRef(function Select(
  {
    label,
    id,
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
    className = "",
    ...props
  },
  ref,
) {
  const classNames = [
    "select-field",
    `select-field--${theme}`,
    border && "select-field--bordered",
    shadow && "select-field--shadow",
    fullWidth && "select-field--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  const selectValueProps =
    value !== undefined ? { value } : { defaultValue };

  const select = (
    <span className={classNames} style={style}>
      {icon && (
        <span className="select-field__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <select ref={ref} id={id} {...selectValueProps} {...props}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const normalizedOption =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option
              key={normalizedOption.value}
              value={normalizedOption.value}
              disabled={normalizedOption.disabled}
            >
              {normalizedOption.label}
            </option>
          );
        })}
      </select>
      <span className="select-field__chevron" aria-hidden="true" />
    </span>
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

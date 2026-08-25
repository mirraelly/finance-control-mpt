import { forwardRef } from "react";
import "./Input.css";

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = "text",
    icon,
    iconPosition = "left",
    prefix,
    border = true,
    shadow = true,
    theme = "auto",
    textColor,
    backgroundColor,
    borderColor,
    fullWidth = false,
    width,
    height,
    className = "",
    ...props
  },
  ref,
) {
  const classNames = [
    "input-field",
    `input-field--${theme}`,
    border && "input-field--bordered",
    shadow && "input-field--shadow",
    fullWidth && "input-field--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...(width && { width }),
    ...(height && { height }),
    ...(textColor && { "--input-color": textColor }),
    ...(backgroundColor && { "--input-background": backgroundColor }),
    ...(borderColor && { "--input-border": borderColor }),
  };

  const input = (
    <span className={classNames} style={style}>
      {icon && iconPosition === "left" && (
        <span className="input-field__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {prefix && <span className="input-field__prefix">{prefix}</span>}
      <input ref={ref} id={id} type={type} {...props} />
      {icon && iconPosition === "right" && (
        <span className="input-field__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </span>
  );

  if (!label) return input;

  return (
    <label className="input-field__label" htmlFor={id}>
      {label}
      {input}
    </label>
  );
});

export default Input;

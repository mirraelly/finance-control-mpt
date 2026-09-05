import { forwardRef, useRef } from "react";
import "./Input.css";

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = "text",
    icon,
    iconPosition = "left",
    onIconClick,
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
  const inputRef = useRef(null);

  const setInputRef = (element) => {
    inputRef.current = element;

    if (typeof ref === "function") {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

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

  const handleIconClick = () => {
    if (onIconClick) {
      onIconClick(inputRef.current);
      return;
    }

    if (type === "date") {
      inputRef.current?.showPicker?.();
    }
  };

  const input = (
    <span className={classNames} style={style}>
      {icon && iconPosition === "left" && (
        <span
          className={`input-field__icon ${
            onIconClick ? "input-field__icon--clickable" : ""
          }`}
          aria-hidden="true"
          onClick={onIconClick ? handleIconClick : undefined}
        >
          {icon}
        </span>
      )}

      {prefix && <span className="input-field__prefix">{prefix}</span>}

      <input ref={setInputRef} id={id} type={type} {...props} />

      {icon && iconPosition === "right" && (
        <span
          className={`input-field__icon ${
            onIconClick || type === "date" ? "input-field__icon--clickable" : ""
          }`}
          aria-hidden="true"
          onClick={onIconClick || type === "date" ? handleIconClick : undefined}
        >
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

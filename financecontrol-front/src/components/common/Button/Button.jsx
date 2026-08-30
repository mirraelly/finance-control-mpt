import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  width,
  height,
  icon,
  iconPosition = "left",
  border = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const classNames = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    border && "button--bordered",
    fullWidth && "button--full-width",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <button className={classNames} style={style} type={type} {...props}>
      {icon && iconPosition === "left" && (
        <span className="button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="button__label">{children}</span>
      {icon && iconPosition === "right" && (
        <span className="button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;

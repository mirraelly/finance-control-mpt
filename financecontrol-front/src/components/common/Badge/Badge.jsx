import { forwardRef } from "react";
import "./Badge.css";

const Badge = forwardRef(function (
  {
    children,
    variant = "default", //  'purple'
    size = "md", // 'sm' | 'md' | 'lg'
    icon,
    className = "",
    style = {},
    ...props
  },
  ref,
) {
  const classNames = ["badge", `badge--${variant}`, `badge--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={ref} className={classNames} style={style} {...props}>
      {icon && (
        <span className="badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="badge__content">{children}</span>
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;

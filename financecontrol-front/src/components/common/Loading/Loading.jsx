import { forwardRef } from "react";
import "./Loading.css";

const Loading = forwardRef(function (
  {
    size = "md",
    color,
    message,
    fullScreen = false,
    className = "",
    style = {},
    ...props
  },
  ref,
) {
  const containerClassNames = [
    "loading-container",
    fullScreen && "loading-container--fullscreen",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const spinnerClassNames = ["loading-spinner", `loading-spinner--${size}`]
    .filter(Boolean)
    .join(" ");

  const spinnerStyle = {
    ...style,
    ...(color && { borderTopColor: color }),
  };

  return (
    <div
      ref={ref}
      className={containerClassNames}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className={spinnerClassNames} style={spinnerStyle} />

      {message ? (
        <span className="loading-container__message">{message}</span>
      ) : (
        <span className="loading-container__sr-only">Carregando...</span>
      )}
    </div>
  );
});

Loading.displayName = "Loading";

export default Loading;

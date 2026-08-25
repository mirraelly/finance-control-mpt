import { forwardRef } from "react";
import "./Card.css";

const Card = forwardRef(function (
  {
    children,
    border = true,
    shadow = true,
    bg = true,
    radius = "lg", // 'none' | 'sm' | 'md' | 'lg' | 'xl'
    padding = "md", // 'none' | 'sm' | 'md' | 'lg'
    width,
    height,
    className = "",
    style = {},
    ...props
  },
  ref,
) {
  const classNames = [
    "card-container",
    border && "card-container--bordered",
    shadow && "card-container--shadow",
    bg && "card-container--bg",
    radius && `card-container--radius-${radius}`,
    padding && `card-container--padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const combinedStyles = {
    ...style,
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div ref={ref} className={classNames} style={combinedStyles} {...props}>
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;

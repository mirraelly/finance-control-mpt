import "./ToggleSwitch.css";

function ToggleSwitch({
  checked = false,
  onChange,
  title,
  disabled = false,
  className = "",
}) {
  const classNames = ["toggle-switch", className].filter(Boolean).join(" ");

  return (
    <button
      className={classNames}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
    >
      <span className="toggle-switch__indicator" />
    </button>
  );
}

export default ToggleSwitch;

import { useEffect, useState } from "react";
import { HugeiconsIcon, Moon02Icon, Sun03Icon } from "../../../assets/icons";
import "./ThemeToggle.css";

const THEME_STORAGE_KEY = "financecontrol_theme";
const THEMES = {
  light: "light",
  dark: "dark",
};

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === THEMES.light || savedTheme === THEMES.dark) {
    return savedTheme;
  }

  return THEMES.light;
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDarkTheme = theme === THEMES.dark;
  const nextTheme = isDarkTheme ? THEMES.light : THEMES.dark;

  useEffect(() => {
    document.documentElement.classList.add("theme-transition");
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);

    return () => clearTimeout(timeout);
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(nextTheme)}
      aria-label={isDarkTheme ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDarkTheme ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      <HugeiconsIcon
        icon={isDarkTheme ? Sun03Icon : Moon02Icon}
        size={20}
        stroke="2"
        color="currentColor"
      />
    </button>
  );
}

export default ThemeToggle;

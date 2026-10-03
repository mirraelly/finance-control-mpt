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

  useEffect(() => {
    document.documentElement.classList.add("theme-transition");
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(
      new CustomEvent("financecontrol:theme-changed", { detail: theme }),
    );

    const timeout = setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 400);

    return () => {
      clearTimeout(timeout);
      document.documentElement.classList.remove("theme-transition");
    };
  }, [theme]);

  useEffect(() => {
    const toggleTheme = () => {
      setTheme((currentTheme) =>
        currentTheme === THEMES.dark ? THEMES.light : THEMES.dark,
      );
    };

    window.addEventListener("financecontrol:toggle-theme", toggleTheme);
    return () =>
      window.removeEventListener("financecontrol:toggle-theme", toggleTheme);
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() =>
        window.dispatchEvent(new Event("financecontrol:toggle-theme"))
      }
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

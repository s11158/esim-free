"use client";

export default function ThemeButton() {
  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    window.localStorage.setItem("esim-theme", nextTheme);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Switch light and dark theme" title="Switch light and dark theme">
      <span className="theme-icon theme-icon-sun" aria-hidden="true">☀</span>
      <span className="theme-icon theme-icon-moon" aria-hidden="true">☾</span>
    </button>
  );
}

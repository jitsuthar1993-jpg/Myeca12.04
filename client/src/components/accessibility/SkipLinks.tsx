import { useState } from "react";

export default function SkipLinks() {
  const [focused, setFocused] = useState(false);

  const skipToMain = () => {
    const main = document.querySelector("main");
    if (main) {
      (main as HTMLElement).focus();
      (main as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
  };

  const skipToNav = () => {
    const nav = document.querySelector("nav");
    if (nav) {
      (nav as HTMLElement).focus();
    }
  };

  const skipToFooter = () => {
    const footer = document.querySelector("footer");
    if (footer) {
      (footer as HTMLElement).focus();
      (footer as HTMLElement).scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-[9999] bg-white shadow-lg transition-transform ${
        focused ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={skipToMain}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </button>
        <button
          onClick={skipToNav}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Skip to navigation
        </button>
        <button
          onClick={skipToFooter}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Skip to footer
        </button>
      </div>
    </div>
  );
}
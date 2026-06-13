"use client";

import { useState } from "react";

const romanticMessages = [
  "Eres Hermosa",
  "Tu eres mis buenos dias",
  "Iluminas cada momento de mi vida",
  "Contigo todo se siente mas bonito",
  "Eres mi razon favorita para sonreir",
  "Mi corazon siempre elige tu nombre",
  "Eres la magia de mis dias"
];

const buttons = [
  ["C", "+/-", "%", "/"],
  ["7", "8", "9", "*"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="]
];

function formatResult(value: number) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(6).replace(/\.?0+$/, "");
}

export default function Home() {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNextValue, setWaitingForNextValue] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [message, setMessage] = useState("Cada resultado traera una frase bonita para ti.");
  const [isDarkMode, setIsDarkMode] = useState(false);

  function handleNumber(value: string) {
    if (waitingForNextValue) {
      setDisplay(value);
      setWaitingForNextValue(false);
      return;
    }

    setDisplay((current) => (current === "0" ? value : `${current}${value}`));
  }

  function handleDecimal() {
    if (waitingForNextValue) {
      setDisplay("0.");
      setWaitingForNextValue(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(`${display}.`);
    }
  }

  function calculateResult(firstValue: number, secondValue: number, currentOperator: string) {
    switch (currentOperator) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return secondValue === 0 ? Number.NaN : firstValue / secondValue;
      default:
        return secondValue;
    }
  }

  function handleOperator(nextOperator: string) {
    const inputValue = Number(display);

    if (storedValue === null) {
      setStoredValue(inputValue);
    } else if (operator && !waitingForNextValue) {
      const result = calculateResult(storedValue, inputValue, operator);
      setStoredValue(result);
      setDisplay(formatResult(result));
    }

    setOperator(nextOperator);
    setWaitingForNextValue(true);
    setMessage("Voy guardando otra frase linda para ti.");
  }

  function handleEquals() {
    if (operator === null || storedValue === null) {
      return;
    }

    const result = calculateResult(storedValue, Number(display), operator);
    const nextMessage = romanticMessages[messageIndex % romanticMessages.length];

    setDisplay(formatResult(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForNextValue(true);
    setMessage(nextMessage);
    setMessageIndex((current) => current + 1);
  }

  function handleClear() {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setWaitingForNextValue(false);
    setMessage("Cada resultado traera una frase bonita para ti.");
  }

  function handleToggleSign() {
    setDisplay((current) => formatResult(Number(current) * -1));
  }

  function handlePercent() {
    setDisplay((current) => formatResult(Number(current) / 100));
    setMessage("Hasta los porcentajes se ven tiernos contigo.");
  }

  function handleButtonClick(value: string) {
    if (/^\d$/.test(value)) {
      handleNumber(value);
      return;
    }

    if (value === ".") {
      handleDecimal();
      return;
    }

    if (value === "=") {
      handleEquals();
      return;
    }

    if (value === "C") {
      handleClear();
      return;
    }

    if (value === "+/-") {
      handleToggleSign();
      return;
    }

    if (value === "%") {
      handlePercent();
      return;
    }

    handleOperator(value);
  }

  return (
    <main className={`aurora-app ${isDarkMode ? "dark" : ""}`}>
      <div className="aurora-glow aurora-glow-left" aria-hidden="true" />
      <div className="aurora-glow aurora-glow-right" aria-hidden="true" />

      <section className="aurora-hero">
        <div className="aurora-copy">
          <p className="eyebrow">Buenos dias hermosa</p>
          <h1>Aurora</h1>
          <p className="subtitle">
            Hecha con carino para acompanar cada cuenta.
          </p>
          <div className="love-note">
            <span className="heart" aria-hidden="true">
              ♥
            </span>
            <p>{message}</p>
          </div>
        </div>

        <div className="calculator-card">
          <div className="calculator-topbar">
            <div className="window-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setIsDarkMode((current) => !current)}
            >
              {isDarkMode ? "Modo claro" : "Dark mode"}
            </button>
          </div>

          <div className="calculator-screen">
            <p className="screen-label">Aurora Calculator</p>
            <div className="screen-value">{display}</div>
          </div>

          <div className="calculator-grid">
            {buttons.flat().map((button) => (
              <button
                key={button}
                type="button"
                className={`calc-button ${
                  /[/*\-+=]/.test(button) ? "accent" : ""
                } ${button === "0" ? "zero" : ""}`}
                onClick={() => handleButtonClick(button)}
              >
                {button}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import { useState } from "react";
import Login from "./components/Login";
import Setup from "./components/Setup";
import MatrixUI from "./components/MatrixUI";
import RadioUI from "./components/RadioUI";
import Results from "./components/Results";
import ThemeToggle from "./components/ThemeToggle";
import { UIType, UserInfo } from "./types";

type Step = "login" | "setup" | "matrix" | "radio" | "results";

interface FinalResult {
  weights: number[];
  cr: number;
}

export default function App() {
  const [step, setStep] = useState<Step>("login");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<FinalResult | null>(null);

  function handleLogin(info: UserInfo) {
    setUser(info);
    setStep("setup");
  }

  function handleStart(type: UIType, crit: string[]) {
    setCriteria(crit);
    setStartTime(Date.now()); // timer zero-point — never rendered during input, only used when logging events
    setStep(type);
  }

  function handleFinish(weights: number[], cr: number, ui: UIType) {
    setResult({ weights, cr });
    setStep(ui);
  }

  function handleRestart() {
    setUser(null);
    setResult(null);
    setStep("login");
  }

  const stepIndex = { login: 1, setup: 1, matrix: 2, radio: 2, results: 3 }[
    step
  ];

  return (
    <div className="console">
      <header className="console-head">
        <div className="brand">
          <span className="brand-mark">&#9679;</span>
          <span className="brand-name">AHP Priority Console</span>
        </div>
        <div className="stepper">
          <span className={`step ${stepIndex === 1 ? "current" : ""}`}>
            01 Setup
          </span>
          <span className={`step ${stepIndex === 2 ? "current" : ""}`}>
            02 Compare
          </span>
          <span className={`step ${stepIndex === 3 ? "current" : ""}`}>
            03 Result
          </span>
        </div>
        <ThemeToggle />
      </header>

      {step === "login" && <Login onSubmit={handleLogin} />}

      {step === "setup" && <Setup onStart={handleStart} />}

      {step === "matrix" && user && (
        <MatrixUI
          criteria={criteria}
          user={user}
          startTime={Date.now()}
          onFinish={handleFinish}
        />
      )}

      {step === "radio" && user && (
        <RadioUI
          criteria={criteria}
          user={user}
          startTime={Date.now()}
          onFinish={handleFinish}
        />
      )}

      {step === "results" && result && (
        <Results name={user?.name} onRestart={handleRestart} />
      )}
    </div>
  );
}

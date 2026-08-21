import { useState } from "react";
import Login from "./components/Login";
import Setup from "./components/Setup";
import MatrixUI from "./components/MatrixUI";
import RadioUI from "./components/RadioUI";
import Results from "./components/Results";
import MatrixTour from "./components/MatrixTour";
import RadioTour from "./components/RadioTour";
import MatrixQuestionnaire from "./components/MatrixQuestionnaire";
import RadioQuestionnaire from "./components/RadioQuestionnaire";
import ThemeToggle from "./components/ThemeToggle";
import { UIType, UserInfo } from "./types";

export type Step =
  | "login"
  | "setup"
  | "matrix"
  | "radio"
  | "results"
  | "matrixtour"
  | "radiotour"
  | "matrixquestionnaire"
  | "radioquestionnaire";

interface FinalResult {
  weights: number[];
  cr: number;
}

export default function App() {
  const [step, setStep] = useState<Step>("login");
  const [user, setUser] = useState<UserInfo>({
    name: "Krishna",
    age: 19,
    education: "B.Tech",
  });
  const criteria = ["Social", "Environment", "Economic"];
  // const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<FinalResult | null>({
    weights: [1, 2, 3],
    cr: 0.1,
  });

  function handleLogin(info: UserInfo) {
    setUser(info);
    setStep("setup");
  }

  // function handleStart(typ: UIType, crit: string[]) {
  //   setCriteria(crit);
  //   setStartTime(Date.now()); // timer zero-point — never rendered during input, only used when logging events
  //   setStep(typ);
  // }

  function handleFinish(weights: number[], cr: number, ui: UIType) {
    setResult({ weights, cr });
    setStep(ui);
  }

  function handleRestart() {
    setUser({
      name: "Krishna",
      age: 19,
      education: "B.Tech",
    });
    setResult(null);
    setStep("login");
  }
  function handleforth(changeStep: Step) {
    setStep(changeStep);
  }
  function handleback(changeStep: Step) {
    setStep(changeStep);
  }
  const stepIndex = {
    login: 1,
    setup: 2,
    matrixtour: 3,
    matrix: 4,
    matrixquestionnaire: 5,
    radiotour: 6,
    radio: 7,
    radioquestionnaire: 8,
    results: 9,
  }[step];

  return (
    <div className="console">
      <header className="console-head">
        <div className="brand">
          <span className="brand-mark">&#9679;</span>
          <span className="brand-name">AHP Priority Console</span>
        </div>
        <div className="stepper">
          <span className={`step ${stepIndex === 1 ? "current" : ""}`}>
            01 Login
          </span>
          <span className={`step ${stepIndex === 2 ? "current" : ""}`}>
            02 SetUp
          </span>
          <span className={`step ${stepIndex === 3 ? "current" : ""}`}>
            03 Matrix Tour
          </span>
          <span className={`step ${stepIndex === 4 ? "current" : ""}`}>
            04 Matirx Compare
          </span>
          <span className={`step ${stepIndex === 5 ? "current" : ""}`}>
            05 Matrix Questionnaire
          </span>
          <span className={`step ${stepIndex === 6 ? "current" : ""}`}>
            06 Radio Tour
          </span>
          <span className={`step ${stepIndex === 7 ? "current" : ""}`}>
            07 Radio Compare
          </span>
          <span className={`step ${stepIndex === 8 ? "current" : ""}`}>
            08 Radio Questionnaire
          </span>
          <span className={`step ${stepIndex === 9 ? "current" : ""}`}>
            09 Finish
          </span>
        </div>
        <ThemeToggle />
      </header>

      {step === "login" && (
        <Login onSubmit={handleLogin} goForth={handleforth} />
      )}

      {step === "setup" && <Setup goBack={handleback} goForth={handleforth} />}

      {step === "matrixtour" && (
        <MatrixTour goBack={handleback} goForth={handleforth} />
      )}

      {step === "matrix" && user && (
        <MatrixUI
          criteria={criteria}
          user={user}
          startTime={Date.now()}
          onFinish={handleFinish}
          goBack={handleback}
          goForth={handleforth}
        />
      )}
      {step === "matrixquestionnaire" && (
        <MatrixQuestionnaire
          user={user}
          goBack={handleback}
          goForth={handleforth}
        />
      )}

      {step === "radiotour" && (
        <RadioTour goBack={handleback} goForth={handleforth} />
      )}

      {step === "radio" && user && (
        <RadioUI
          criteria={criteria}
          user={user}
          startTime={Date.now()}
          onFinish={handleFinish}
          goBack={handleback}
          goForth={handleforth}
        />
      )}
      {step === "radioquestionnaire" && (
        <RadioQuestionnaire
          user={user}
          goBack={handleback}
          goForth={handleforth}
        />
      )}
      {step === "results" && result && (
        <Results name={user?.name} onRestart={handleRestart} />
      )}
    </div>
  );
}

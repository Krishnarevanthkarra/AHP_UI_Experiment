import { useState } from "react";
import { UIType } from "../types";
interface Props {
  onStart: (uiType: UIType, criteria: string[]) => void;
}

const DEFAULTS = [
  "Social",
  "Environmental",
  "Economical",
  "Technical",
  "Political",
  "Legal",
  "Safety",
  "Cost",
];

export default function Setup({ onStart }: Props) {
  const [uiType, setUiType] = useState<UIType>("matrix");
  const [count, setCount] = useState(3);
  const [names, setNames] = useState<string[]>(DEFAULTS.slice(0, 3));

  function updateCount(raw: number) {
    const clamped = Math.min(8, Math.max(2, raw || 2));
    setCount(clamped);
    setNames((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped)
        next.push(DEFAULTS[next.length] || `Criterion ${next.length + 1}`);
      return next;
    });
  }

  function updateName(i: number, value: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  }

  function handleStart() {
    const finalNames = names.map((n, i) => n.trim() || `Criterion ${i + 1}`);
    onStart(uiType, finalNames);
  }
  function handleBack() {
    const finalNames = names.map((n, i) => n.trim() || `Criterion ${i + 1}`);
    onStart("login", finalNames);
  }

  return (
    <section className="panel">
      <h1>Set up your comparison</h1>
      <p className="lede">
        List the criteria you're weighing against each other.
      </p>

      {/* <div className="ui-choice">
        <button
          type="button"
          className={`ui-card ${uiType === "matrix" ? "active" : ""}`}
          onClick={() => setUiType("matrix")}
        >
          <span className="ui-card-title">Matrix Grid</span>
          <span className="ui-card-desc">
            Edit the upper triangle of an N&times;N table. Reciprocals fill
            themselves in below the diagonal.
          </span>
        </button>
        <button
          type="button"
          className={`ui-card ${uiType === "radio" ? "active" : ""}`}
          onClick={() => setUiType("radio")}
        >
          <span className="ui-card-title">Pairwise Radio</span>
          <span className="ui-card-desc">
            For every pair, pick which criterion wins, then how much more it
            matters.
          </span>
        </button>
      </div> */}

      <div className="field-row">
        <label htmlFor="crit-count">Number of criteria</label>
        <input
          id="crit-count"
          type="number"
          min={2}
          max={8}
          value={count}
          onChange={(e) => updateCount(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="crit-names">
        {names.map((n, i) => (
          <input
            key={i}
            value={n}
            placeholder={`Criterion ${i + 1}`}
            onChange={(e) => updateName(i, e.target.value)}
          />
        ))}
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={handleBack}>
          ⬅ Back
        </button>
        <button className="btn-primary" onClick={handleStart}>
          Start
        </button>
      </div>
    </section>
  );
}

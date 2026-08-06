import { useMemo, useRef, useState } from "react";
import { computeAHP, matrixFromUpper } from "../ahp";
import { logRadioEvent } from "../api";
import { UIType, UserInfo } from "../types";

interface Props {
  criteria: string[];
  user: UserInfo;
  startTime: number; // ms timestamp captured when the user pressed Start — not shown, only used to compute `timer`
  onFinish: (weights: number[], cr: number, ui: UIType) => void;
}

type Winner = "i" | "j" | null;

function upperFrom(
  winners: Winner[][],
  values: (number | null)[][],
  n: number,
): number[][] {
  const u = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = winners[i][j];
      const v = values[i][j];
      if (!w || !v) {
        u[i][j] = 1; // unanswered pair defaults to equal
        continue;
      }
      u[i][j] = w === "i" ? v : 1 / v;
    }
  }
  return u;
}

export default function RadioUI({
  criteria,
  user,
  startTime,
  onFinish,
}: Props) {
  const n = criteria.length;
  const [winners, setWinners] = useState<Winner[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(null)),
  );
  const [values, setValues] = useState<(number | null)[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(null)),
  );
  const clickCount = useRef(0);
  const voteCounts = useRef<Record<string, number>>({});

  function elapsed(): number {
    return (Date.now() - startTime) / 1000;
  }

  const upper = useMemo(
    () => upperFrom(winners, values, n),
    [winners, values, n],
  );
  const matrix = useMemo(() => matrixFromUpper(n, upper), [n, upper]);
  const { weights, CR } = useMemo(() => computeAHP(matrix), [matrix]);

  function handleWinnerChange(
    i: number,
    j: number,
    winner: Exclude<Winner, null>,
  ) {
    const nextWinners = winners.map((row) => row.slice()) as Winner[][];
    nextWinners[i][j] = winner;
    setWinners(nextWinners);

    const key = `${i}-${j}-winner`;
    voteCounts.current[key] = (voteCounts.current[key] || 0) + 1;
    clickCount.current += 1;

    const result = computeAHP(
      matrixFromUpper(n, upperFrom(nextWinners, values, n)),
    );

    logRadioEvent({
      ...user,
      clicknumber: clickCount.current,
      timer: Number(elapsed().toFixed(3)),
      cr: Number(result.CR.toFixed(6)),
      option: `${criteria[i]}-${criteria[j]}-winner`,
      value: winner === "i" ? criteria[i] : criteria[j],
      option_vote_count: voteCounts.current[key],
    });
  }

  function handleValueChange(i: number, j: number, value: number) {
    const nextValues = values.map((row) => row.slice());
    nextValues[i][j] = value;
    setValues(nextValues);

    const key = `${i}-${j}-value`;
    voteCounts.current[key] = (voteCounts.current[key] || 0) + 1;
    clickCount.current += 1;

    const result = computeAHP(
      matrixFromUpper(n, upperFrom(winners, nextValues, n)),
    );

    logRadioEvent({
      ...user,
      clicknumber: clickCount.current,
      timer: Number(elapsed().toFixed(3)),
      cr: Number(result.CR.toFixed(6)),
      option: `${criteria[i]}-${criteria[j]}-value`,
      value: String(value),
      option_vote_count: voteCounts.current[key],
    });
  }

  function handleReset() {
    setWinners(Array.from({ length: n }, () => Array(n).fill(null)));
    setValues(Array.from({ length: n }, () => Array(n).fill(null)));
    voteCounts.current.reset = (voteCounts.current.reset || 0) + 1;
    clickCount.current += 1;

    logRadioEvent({
      ...user,
      clicknumber: clickCount.current,
      timer: Number(elapsed().toFixed(3)),
      cr: 0,
      option: "reset",
      value: "1",
      option_vote_count: voteCounts.current.reset,
    });
  }
  const crClass = CR < 0.1 ? "good" : "bad";
  const circumference = 326.7;
  const pct = Math.min(CR / 0.3, 1);
  const dashOffset = circumference * (1 - pct);
  const strokeVar = crClass === "good" ? "var(--good)" : "var(--bad)";
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) pairs.push([i, j]);

  return (
    <section className="panel">
      <h1>Pairwise Comparison</h1>
      <p className="lede">
        For each pair, first choose which criterion matters more &mdash; then
        its intensity (1&ndash;9) unlocks.
      </p>
      <div className="gauge-card">
        <div className="gauge">
          <svg viewBox="0 0 120 120">
            <circle className="gauge-track" cx={60} cy={60} r={52} />
            <circle
              className="gauge-fill"
              cx={60}
              cy={60}
              r={52}
              style={{ strokeDashoffset: dashOffset, stroke: strokeVar }}
            />
          </svg>
          <div className="gauge-value">
            <span>{CR.toFixed(4)}</span>
            <span className="gauge-label">CR</span>
          </div>
        </div>
        <div className={`gauge-status ${crClass === "good" ? "" : crClass}`}>
          {CR < 0.1 ? "Acceptable (< 0.10)" : "Inconsistent — revise judgments"}
        </div>
      </div>
      <div id="radio-table">
        {pairs.map(([i, j]) => {
          const winner = winners[i][j];
          const value = values[i][j];
          return (
            <div className="radio-row" key={`${i}-${j}`}>
              <div className="radio-row-heading">
                <b>{criteria[i]}</b> vs <b>{criteria[j]}</b> &mdash; which
                matters more, and how much?
              </div>
              <div className="radio-line">
                <div className="radio-group">
                  {(["i", "j"] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`radio-opt ${winner === opt ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`w-${i}-${j}`}
                        checked={winner === opt}
                        onChange={() => handleWinnerChange(i, j, opt)}
                      />
                      {opt === "i" ? criteria[i] : criteria[j]}
                    </label>
                  ))}
                </div>
                <div className="divider" />
                <div className="radio-group value-group">
                  {Array.from({ length: 9 }, (_, idx) => idx + 1).map((v) => (
                    <label
                      key={v}
                      className={`radio-opt ${!winner ? "disabled" : ""} ${value === v ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`v-${i}-${j}`}
                        disabled={!winner}
                        checked={value === v}
                        onChange={() => handleValueChange(i, j, v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={handleReset}>
          Reset Matrix
        </button>
        <button
          className="btn-ghost"
          onClick={() => onFinish(weights, CR, "radiotour")}
        >
          ⬅ Back
        </button>
        <button
          className="btn-primary"
          disabled={CR >= 0.1}
          onClick={() => onFinish(weights, CR, "results")}
        >
          Finish
        </button>
      </div>
    </section>
  );
}

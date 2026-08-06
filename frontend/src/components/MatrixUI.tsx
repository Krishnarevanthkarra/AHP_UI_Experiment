import { useMemo, useRef, useState } from "react";
import { buildScale, computeAHP, matrixFromUpper } from "../ahp";
import { logMatrixEvent } from "../api";
import { UIType, UserInfo } from "../types";

interface Props {
  criteria: string[];
  user: UserInfo;
  startTime: number; // ms timestamp captured when the user pressed Start — not shown, only used to compute `timer`
  onFinish: (weights: number[], cr: number, ui: UIType) => void;
}

const SCALE = buildScale();

export default function MatrixUI({
  criteria,
  user,
  startTime,
  onFinish,
}: Props) {
  const n = criteria.length;
  const [upper, setUpper] = useState<number[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(1)),
  );
  const clickCount = useRef(0);
  const voteCounts = useRef<Record<string, number>>({});

  const matrix = useMemo(() => matrixFromUpper(n, upper), [n, upper]);
  const { weights, CR } = useMemo(() => computeAHP(matrix), [matrix]);

  function elapsed(): number {
    return (Date.now() - startTime) / 1000;
  }

  function handleCellChange(i: number, j: number, value: number) {
    const nextUpper = upper.map((row) => row.slice());
    nextUpper[i][j] = value;
    setUpper(nextUpper);

    const key = `${i}-${j}`;
    voteCounts.current[key] = (voteCounts.current[key] || 0) + 1;
    clickCount.current += 1;

    const result = computeAHP(matrixFromUpper(n, nextUpper));

    logMatrixEvent({
      ...user,
      clicknumber: clickCount.current,
      timer: Number(elapsed().toFixed(3)),
      cr: Number(result.CR.toFixed(6)),
      option: `${criteria[i]}-${criteria[j]}`,
      value,
      option_vote_count: voteCounts.current[key],
    });
  }

  function handleReset() {
    setUpper(Array.from({ length: n }, () => Array(n).fill(1)));
    voteCounts.current.reset = (voteCounts.current.reset || 0) + 1;
    clickCount.current += 1;

    logMatrixEvent({
      ...user,
      clicknumber: clickCount.current,
      timer: Number(elapsed().toFixed(3)),
      cr: 0,
      option: "reset",
      value: 1,
      option_vote_count: voteCounts.current.reset,
    });
  }

  const crClass = CR < 0.1 ? "good" : "bad";
  const circumference = 326.7;
  const pct = Math.min(CR / 0.3, 1);
  const dashOffset = circumference * (1 - pct);
  const strokeVar = crClass === "good" ? "var(--good)" : "var(--bad)";

  return (
    <section className="panel">
      <h1>Category Comparison</h1>
      <p className="lede">
        Establish relative priorities between criteria using a 1&ndash;9 scale
        (or its reciprocal). Higher values favor the row over the column.
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

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              {criteria.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((rowName, i) => (
              <tr key={rowName}>
                <td className="row-head">{rowName}</td>
                {criteria.map((_, j) => {
                  if (i === j)
                    return (
                      <td key={j} className="diag">
                        1
                      </td>
                    );
                  if (j > i) {
                    return (
                      <td key={j}>
                        <select
                          defaultValue=""
                          onChange={(e) =>
                            handleCellChange(i, j, parseFloat(e.target.value))
                          }
                        required>
                          <option value="" disabled>Select</option>
                          {SCALE.map((opt) => (
                            <option key={opt.label} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  }
                  return (
                    <td key={j}>
                      <span className="lower">
                        {(1 / upper[j][i]).toFixed(3)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="fineprint">
        Values below the diagonal are auto-calculated reciprocals.
      </p>

      <div className="btn-row">
        <button className="btn-ghost" onClick={handleReset}>
          Reset Matrix
        </button>
        <button
          className="btn-ghost"
          onClick={() => onFinish(weights, CR, "matrixtour")}
        >
          ⬅ Back
        </button>
        <button
          className="btn-primary"
          disabled={CR >= 0.1}
          onClick={() => onFinish(weights, CR, "radiotour")}
        >
          Next
        </button>
      </div>
    </section>
  );
}

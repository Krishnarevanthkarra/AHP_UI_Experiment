import { useMemo, useRef, useState } from "react";
import { buildScale, computeAHP, matrixFromUpper } from "../ahp";
import { logMatrixEvent } from "../api";
import { UIType, UserInfo } from "../types";
import type { Step } from "../App";
import { compare } from "../types";

interface Props {
  criteria: string[];
  user: UserInfo;
  startTime: number;
  onFinish: (weights: number[], cr: number, ui: UIType) => void;
  goBack(step: Step): void;
  goForth(step: Step): void;
}

interface MatrixSuggestion {
  i: number;
  j: number;
  currentValue: number;
  suggestedValue: number;
  currentCR: number;
  suggestedCR: number;
  improvement: number;
}

const SCALE = buildScale();
function formatAHPValue(value: number): string {
  if (value === 1 / 1) {
    return "1";
  } else if (value === 1 / 2) {
    return "1/2";
  } else if (value === 1 / 3) {
    return "1/3";
  } else if (value === 1 / 4) {
    return "1/4";
  } else if (value === 1 / 5) {
    return "1/5";
  } else if (value === 1 / 6) {
    return "1/6";
  } else if (value === 1 / 7) {
    return "1/7";
  } else if (value === 1 / 8) {
    return "1/8";
  } else {
    return "1/9";
  }
}
export default function MatrixUI({
  criteria,
  user,
  startTime,
  goBack,
  goForth,
}: Props) {
  const [action, setAction] = useState("Please start giving your priorities.");

  const [allfilled, setAllFilled] = useState(false);

  const n = criteria.length;

  const [upper, setUpper] = useState<number[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(1)),
  );

  const [count, setCount] = useState<number[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(0)),
  );

  const [showRealCR, setShowRealCR] = useState(false);

  const [suggestions, setSuggestions] = useState<MatrixSuggestion[]>([]);

  const clickCount = useRef(0);

  const voteCounts = useRef<Record<string, number>>({});

  /*
   * ---------------------------------------------------------
   * MATRIX + CR
   * ---------------------------------------------------------
   */

  const matrix = useMemo(() => matrixFromUpper(n, upper), [n, upper]);

  const { CR } = useMemo(() => computeAHP(matrix), [matrix]);

  /*
   * ---------------------------------------------------------
   * TIMER
   * ---------------------------------------------------------
   */

  function elapsed(): number {
    return (Date.now() - startTime) / 1000;
  }

  /*
   * ---------------------------------------------------------
   * CHECK WHETHER ALL PAIRS ARE FILLED
   * ---------------------------------------------------------
   */

  function checkAllFilled(nextCount: number[][]): boolean {
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        if (nextCount[i][j] === 0) {
          return false;
        }
      }
    }

    return true;
  }

  /*
   * ---------------------------------------------------------
   * FIND TOP 3 MATRIX SUGGESTIONS
   * ---------------------------------------------------------
   *
   * For every editable cell:
   *
   *   current value
   *        ↓
   *   try every SCALE value
   *        ↓
   *   calculate CR
   *        ↓
   *   keep the value producing the largest CR reduction
   *
   * Then sort all possible changes by improvement
   * and keep only the best three.
   */

  function calculateSuggestions(
    currentUpper: number[][],
    currentCR: number,
  ): MatrixSuggestion[] {
    const found: MatrixSuggestion[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const currentValue = currentUpper[i][j];

        let bestValue = currentValue;

        let bestCR = currentCR;

        for (const option of SCALE) {
          const candidateValue = option.value;

          if (candidateValue === currentValue) {
            continue;
          }

          const candidateUpper = currentUpper.map((row) => row.slice());

          candidateUpper[i][j] = candidateValue;

          const candidateMatrix = matrixFromUpper(n, candidateUpper);

          const result = computeAHP(candidateMatrix);

          if (Number.isFinite(result.CR) && result.CR < bestCR) {
            bestCR = result.CR;
            bestValue = candidateValue;
          }
        }

        const improvement = currentCR - bestCR;

        if (bestValue !== currentValue && improvement > 0) {
          found.push({
            i,
            j,
            currentValue,
            suggestedValue: bestValue,
            currentCR,
            suggestedCR: bestCR,
            improvement,
          });
        }
      }
    }

    found.sort((a, b) => b.improvement - a.improvement);

    return found.slice(0, 2);
  }

  /*
   * ---------------------------------------------------------
   * MATRIX CELL CHANGE
   * ---------------------------------------------------------
   */

  function handleCellChange(i: number, j: number, value: number) {
    /*
     * Any new judgment invalidates the
     * previously calculated CR and suggestions.
     */
    setShowRealCR(false);
    setSuggestions([]);

    const nextUpper = upper.map((row) => row.slice());

    nextUpper[i][j] = value;

    setUpper(nextUpper);

    /*
     * Logging
     */

    const key = `${i}-${j}`;

    voteCounts.current[key] = (voteCounts.current[key] || 0) + 1;

    clickCount.current += 1;

    const result = computeAHP(matrixFromUpper(n, nextUpper));

    if (user !== null) {
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

    /*
     * Update count without mutating React state.
     */

    const nextCount = count.map((row) => row.slice());

    nextCount[i][j] += 1;

    setCount(nextCount);

    setAllFilled(checkAllFilled(nextCount));

    /*
     * Action message
     */

    const asorthan = value === 1 ? "as" : "than";

    if (value >= 1) {
      setAction(
        `${criteria[i]} is ${compare[value]} ${asorthan} ${criteria[j]}`,
      );
    } else {
      setAction(
        `${criteria[j]} is ${compare[Math.round(1 / value)]} than ${
          criteria[i]
        }`,
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * CALCULATE CR
   * ---------------------------------------------------------
   */

  function handleCalculateCR() {
    setShowRealCR(true);

    if (CR >= 0.1) {
      const nextSuggestions = calculateSuggestions(upper, CR);

      setSuggestions(nextSuggestions);
    } else {
      setSuggestions([]);
    }
  }

  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  function handleReset() {
    setUpper(Array.from({ length: n }, () => Array(n).fill(1)));

    setCount(Array.from({ length: n }, () => Array(n).fill(0)));

    setShowRealCR(false);
    setSuggestions([]);
    setAllFilled(false);

    voteCounts.current.reset = (voteCounts.current.reset || 0) + 1;

    clickCount.current += 1;

    if (user !== null) {
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

    setAction("Matrix reset — start your comparisons from the beginning.");
  }

  /*
   * ---------------------------------------------------------
   * CR DISPLAY STATE
   * ---------------------------------------------------------
   */

  const crStatus = !showRealCR ? "pending" : CR < 0.1 ? "good" : "bad";

  const effectiveCR = showRealCR ? CR : null;

  const circumference = 326.7;

  const pct = effectiveCR === null ? 0 : Math.min(effectiveCR / 0.3, 1);

  const dashOffset = circumference * (1 - pct);

  const strokeVar =
    crStatus === "good"
      ? "var(--good)"
      : crStatus === "bad"
        ? "var(--bad)"
        : "var(--warn)";

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  function handleback() {
    goBack("matrixtour");
  }

  function handleforth() {
    goForth("radiotour");
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <section className="panel">
      <h1>Category Comparison</h1>

      <h3 className="fineprint">CR Ratio</h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div className="gauge-card">
          <div className="gauge">
            <svg viewBox="0 0 120 120">
              <circle className="gauge-track" cx={60} cy={60} r={52} />

              <circle
                className="gauge-fill"
                cx={60}
                cy={60}
                r={52}
                style={{
                  strokeDashoffset: dashOffset,
                  stroke: strokeVar,
                }}
              />
            </svg>

            <div className={`gauge-value ${crStatus}`}>
              <span>{effectiveCR === null ? "—" : effectiveCR.toFixed(4)}</span>

              <span className="gauge-label">CR</span>
            </div>
          </div>

          <div className={`gauge-status ${crStatus}`}>
            {crStatus === "pending"
              ? "Calculate CR"
              : crStatus === "good"
                ? "Acceptable (< 0.10)"
                : "Inconsistent — revise judgments"}
          </div>
        </div>

        <button className="btn-primary" onClick={handleCalculateCR}>
          Calculate CR
        </button>
      </div>

      <div className="action">
        <h3 className={crStatus}>Action Performed:</h3>

        <p>{action}</p>
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
                  /*
                   * Diagonal
                   */

                  if (i === j) {
                    return (
                      <td key={j} className="diag">
                        1
                      </td>
                    );
                  }

                  /*
                   * Editable upper triangle
                   */

                  if (j > i) {
                    const suggestion = suggestions.find(
                      (s) => s.i === i && s.j === j,
                    );

                    const hasValue = count[i][j] > 0;

                    return (
                      <td
                        key={j}
                        className={suggestion ? "matrix-suggestion" : ""}
                      >
                        <select
                          value={hasValue ? String(upper[i][j]) : ""}
                          onChange={(e) =>
                            handleCellChange(i, j, parseFloat(e.target.value))
                          }
                          className={suggestion ? "suggested-select" : ""}
                          required
                        >
                          <option value="" disabled>
                            Select
                          </option>

                          {SCALE.map((opt) => (
                            <option key={opt.label} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        {suggestion && (
                          <span className="suggestion-value">
                            Try {formatAHPValue(suggestion.suggestedValue)}
                          </span>
                        )}
                      </td>
                    );
                  }

                  /*
                   * Lower triangle
                   */

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

      <br />

      <h3>
        <b>Priority Counts are as Follows</b>
      </h3>

      <div className="fineprint">
        <p>1 : Equally preferred</p>
        <p>3 : Moderately preferred</p>
        <p>5 : Strongly preferred</p>
        <p>7 : Very strongly preferred</p>
        <p>9 : Extremely preferred</p>
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={handleReset}>
          Reset Matrix
        </button>

        <button className="btn-ghost" onClick={handleback}>
          ⬅ Back
        </button>

        <button
          className="btn-primary"
          disabled={!(CR < 0.1 && allfilled)}
          onClick={handleforth}
        >
          Next
        </button>
      </div>
    </section>
  );
}

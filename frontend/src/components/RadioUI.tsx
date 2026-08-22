import { useMemo, useRef, useState } from "react";
import { computeAHP, matrixFromUpper } from "../ahp";
import { logRadioEvent } from "../api";
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

type Winner = "i" | "j" | null;

function upperFrom(
  winners: Winner[][],
  values: (number | null)[][],
  n: number,
): number[][] {
  const u = Array.from({ length: n }, () => Array(n).fill(1));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const winner = winners[i][j];
      const value = values[i][j];

      if (!winner || value === null) {
        u[i][j] = 1;
        continue;
      }

      /*
       * If i wins:
       *     i is `value` times more important than j
       *
       * If j wins:
       *     j is `value` times more important than i
       *     therefore i/j = 1/value
       */
      u[i][j] = winner === "i" ? value : 1 / value;
    }
  }

  return u;
}

export default function RadioUI({
  criteria,
  user,
  startTime,
  goBack,
  goForth,
}: Props) {
  const n = criteria.length;

  const [action, setAction] = useState("Please start giving your priorities.");

  const [allfilled, setAllFilled] = useState(false);

  const [winners, setWinners] = useState<Winner[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(null)),
  );

  const [values, setValues] = useState<(number | null)[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(null)),
  );

  const [count, setCount] = useState<number[][]>(() =>
    Array.from({ length: n }, () => Array(n).fill(0)),
  );

  const [showRealCR, setShowRealCR] = useState(false);

  const clickCount = useRef(0);
  const voteCounts = useRef<Record<string, number>>({});

  /*
   * ---------------------------------------------------------
   * MATRIX + CR
   * ---------------------------------------------------------
   */

  const upper = useMemo(
    () => upperFrom(winners, values, n),
    [winners, values, n],
  );

  const matrix = useMemo(() => matrixFromUpper(n, upper), [n, upper]);

  const { CR } = useMemo(() => computeAHP(matrix), [matrix]);

  /*
   * The real CR is always calculated.
   *
   * But it is hidden until the user presses
   * "Calculate CR".
   */
  const effectiveCR = showRealCR ? CR : 0;

  const crClass = effectiveCR < 0.1 ? "good" : "bad";

  const circumference = 326.7;

  const pct = Math.min(effectiveCR / 0.3, 1);

  const dashOffset = circumference * (1 - pct);

  const strokeVar = crClass === "good" ? "var(--good)" : "var(--bad)";

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
   * ACTION MESSAGE
   * ---------------------------------------------------------
   */

  function updateAction(
    i: number,
    j: number,
    winner: Winner,
    value: number | null,
  ) {
    if (!winner || value === null) {
      return;
    }

    const winnerName = winner === "i" ? criteria[i] : criteria[j];

    const loserName = winner === "i" ? criteria[j] : criteria[i];

    /*
     * compare[value] describes how much MORE IMPORTANT
     * the selected winner is.
     *
     * Example:
     * winner = "i"
     * value = 5
     *
     * Social is Strongly more important than Environment.
     */
    const priority = compare[value] || "more important";
    const isorthan = value == 1 ? "as" : "than";

    const newAction = `${winnerName} is ${priority} ${isorthan} ${loserName}.`;

    setAction(newAction);
  }

  /*
   * ---------------------------------------------------------
   * WINNER CHANGE
   * ---------------------------------------------------------
   */

  function handleWinnerChange(
    i: number,
    j: number,
    winner: Exclude<Winner, null>,
  ) {
    /*
     * Any new user interaction means that the old
     * displayed CR should disappear.
     */
    setShowRealCR(false);

    const nextWinners = winners.map((row) => row.slice()) as Winner[][];

    nextWinners[i][j] = winner;

    setWinners(nextWinners);

    /*
     * If a value was already selected, immediately
     * update the action to reflect the new winner.
     */
    const currentValue = values[i][j];

    if (currentValue !== null) {
      updateAction(i, j, winner, currentValue);
    }

    /*
     * Logging
     */
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

  /*
   * ---------------------------------------------------------
   * VALUE / INTENSITY CHANGE
   * ---------------------------------------------------------
   */

  function handleValueChange(i: number, j: number, value: number) {
    /*
     * Hide previously calculated CR.
     */
    setShowRealCR(false);

    const nextValues = values.map((row) => row.slice());

    nextValues[i][j] = value;

    setValues(nextValues);

    /*
     * Update action using the CURRENT winner.
     */
    const winner = winners[i][j];

    if (winner) {
      updateAction(i, j, winner, value);
    }

    /*
     * Count this pair as filled.
     */
    const nextCount = count.map((row) => row.slice());

    nextCount[i][j] += 1;

    setCount(nextCount);

    setAllFilled(checkAllFilled(nextCount));

    /*
     * Logging
     */
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

  /*
   * ---------------------------------------------------------
   * CALCULATE CR BUTTON
   * ---------------------------------------------------------
   */

  function handleCalculateCR() {
    /*
     * Show the REAL AHP calculated CR.
     */
    setShowRealCR(true);
  }

  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  function handleReset() {
    setWinners(Array.from({ length: n }, () => Array(n).fill(null)));

    setValues(Array.from({ length: n }, () => Array(n).fill(null)));

    setCount(Array.from({ length: n }, () => Array(n).fill(0)));

    setShowRealCR(false);

    setAction("Reset — start your comparisons from the beginning.");

    setAllFilled(false);

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

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  function handleback() {
    goBack("radiotour");
  }

  function handleforth() {
    goForth("results");
  }

  /*
   * ---------------------------------------------------------
   * PAIRS
   * ---------------------------------------------------------
   */

  const pairs: Array<[number, number]> = [];

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j]);
    }
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <section className="panel">
      <h1>Pairwise Comparison</h1>

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

            <div className="gauge-value">
              <span>{effectiveCR.toFixed(4)}</span>

              <span className="gauge-label">CR</span>
            </div>
          </div>

          <div className={`gauge-status ${crClass === "good" ? "" : crClass}`}>
            {effectiveCR < 0.1
              ? "Acceptable (< 0.10)"
              : "Inconsistent — revise judgments"}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleCalculateCR}
          // disabled={!allfilled}
        >
          Calculate CR
        </button>
      </div>

      <div className="action">
        <h3 className={crClass}>Action Performed:</h3>

        <p>{action}</p>
      </div>
      <br></br>
      <div id="radio-table">
        {pairs.map(([i, j]) => {
          const winner = winners[i][j];
          const value = values[i][j];

          return (
            <div className="radio-row" key={`${i}-${j}`}>
              <div className="radio-row-heading">
                <b>{criteria[i]}</b>
                {" vs "}
                <b>{criteria[j]}</b>
                {" — which matters more, and how much?"}
              </div>

              <div className="radio-line">
                <div className="radio-group">
                  {(["i", "j"] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`radio-opt ${
                        winner === opt ? "selected" : ""
                      }`}
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
                      className={`radio-opt ${!winner ? "disabled" : ""} ${
                        value === v ? "selected" : ""
                      }`}
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
      <br></br>
      <h3>
        <b>Priority Counts are as Follows</b>
      </h3>

      <p className="fineprint">
        <p>1 : Equally preferred</p>
        <p>3 : Moderately preferred</p>
        <p>5 : Strongly preferred</p>
        <p>7 : Very strongly preferred</p>
        <p>9 : Extremely preferred</p>
      </p>

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
        <button
          className="btn-primary"
          // disabled={!(CR < 0.1 && allfilled)}
          onClick={handleforth}
        >
          Next
        </button>
      </div>
    </section>
  );
}

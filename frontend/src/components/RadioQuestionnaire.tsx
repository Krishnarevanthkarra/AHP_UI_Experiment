import { useState } from "react";
import { logRadioQuestionnaire } from "../api";
import { RadioQuestionnairePayload, UserInfo } from "../types";

interface props {
  goBack: () => void;
  goForth: () => void;
  user: UserInfo;
}

export default function RadioQuestionnaire({ goBack, goForth, user }: props) {
  const [error, setError] = useState("");
  const [responses, setResponses] = useState<RadioQuestionnairePayload>({
    mental: -1,
    physical: -1,
    temporal: -1,
    performance: -1,
    effort: -1,
    frustation: -1,
    // get(key: string): number{
    //  if(key==="mental"){
    //   return this.mental;
    //  }else if(key==="physical"){

    //  }
    // }
  });
  function getValue(key: string): number {
    if (key === "mental") {
      return responses.mental;
    } else if (key === "physical") {
      return responses.physical;
    } else if (key === "temporal") {
      return responses.temporal;
    } else if (key === "effort") {
      return responses.effort;
    } else if (key === "performance") {
      return responses.performance;
    } else {
      return responses.frustation;
    }
  }
  function handleSubmit(): void {
    if (Object.values(responses).some((value) => value === -1)) {
      setError("Please Complete the Survey");
      return;
    }
    setError("");
    logRadioQuestionnaire({ ...responses, ...user });
    goForth();
  }
  const questions = [
    {
      id: "mental",
      title: "Mental Demand",
      description: "How mentally demanding was the task?",
    },
    {
      id: "physical",
      title: "Physical Demand",
      description: "How physically demanding was the task?",
    },
    {
      id: "temporal",
      title: "Temporal Demand",
      description: "How hurried or rushed was the pace of the task?",
    },
    {
      id: "performance",
      title: "Performance",
      description:
        "How successful were you in accomplishing what you were asked to do?",
    },
    {
      id: "effort",
      title: "Effort",
      description:
        "How hard did you have to work to accomplish your level of performance?",
    },
    {
      id: "frustation",
      title: "Frustration",
      description:
        "How insecure, discouraged, irritated, stressed, and annoyed were you?",
    },
  ];
  return (
    <div className="panel nasa-panel">
      <h1>NASA Task Load Index (NASA-TLX)</h1>

      <p className="nasa-desc">
        Please rate each aspect of your experience for the task you just
        completed.
      </p>

      {questions.map((q, index) => (
        <div key={index} className="tlx-question">
          <div className="tlx-header">
            <div>
              <h3>{q.title}</h3>
              <p>{q.description}</p>
            </div>
          </div>

          <div className="tlx-scale">
            <span>Very Low</span>

            <div className="radio-scale">
              {[...Array(10)].map((_, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={q.id}
                    value={i}
                    checked={getValue(q.id) === i}
                    onChange={() =>
                      setResponses((prev) => ({
                        ...prev,
                        [q.id]: i,
                      }))
                    }
                  />
                  <span className="dot"></span>
                </label>
              ))}
            </div>

            <span>Very High</span>
          </div>
        </div>
      ))}

      {error && <p className="form-error">{error}</p>}
      <div className="btn-row">
        <button className="btn-ghost" onClick={goBack}>
          ← Back
        </button>

        <button className="btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

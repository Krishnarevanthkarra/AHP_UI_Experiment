import {
  UserInfo,
  MatrixEventPayload,
  RadioEventPayload,
  MatrixQuestionnairePayload,
  RadioQuestionnairePayload,
} from "./types";

async function postJSON(url: string, body: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // Logging is best-effort — a dropped event shouldn't block the user
    // from continuing their comparison.
    console.warn("Failed to reach API", url, e);
  }
}

export function logMatrixEvent(payload: MatrixEventPayload): Promise<void> {
  return postJSON("/api/matrix/event", payload);
}

export function logRadioEvent(payload: RadioEventPayload): Promise<void> {
  return postJSON("/api/radio/event", payload);
}

async function postSurvey(
  url: string,
  payload: MatrixQuestionnairePayload & UserInfo,
): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn("Failed to reach API, url, e");
  }
}

export function logMatrixQuestionnaire(
  payload: MatrixQuestionnairePayload & UserInfo,
): Promise<void> {
  return postSurvey("/api/matrix_survey", payload);
}

export function logRadioQuestionnaire(
  payload: RadioQuestionnairePayload & UserInfo,
): Promise<void> {
  return postSurvey("/api/radio_survey", payload);
}

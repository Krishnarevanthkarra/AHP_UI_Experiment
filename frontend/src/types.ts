export type UIType =
  | "matrix"
  | "radio"
  | "login"
  | "results"
  | "setup"
  | "matrixtour"
  | "radiotour"
  // | "matrixquestionnaire"
  // | "radioquestionnaire";

export interface UserInfo {
  name: string;
  education: string;
  age: number;
}
export const compare = [
  "",
  "Equally important",

  "Equally to moderately more important",
  "Moderately more important",

  "Moderately to strongly more important",

  "Strongly more important",

  "Strongly to very strongly more important",

  "Very strongly more important",

  "Very strongly to extremely more important",

  "Extremely more important",
];
export interface MatrixEventPayload extends UserInfo {
  clicknumber: number;
  timer: number;
  cr: number;
  option: string;
  value: number;
  option_vote_count: number;
}

export interface RadioEventPayload extends UserInfo {
  clicknumber: number;
  timer: number;
  cr: number;
  option: string;
  value: string;
  option_vote_count: number;
}

export interface MatrixQuestionnairePayload {
  mental: number;
  physical: number;
  temporal: number;
  performance: number;
  effort: number;
  frustation: number;
  // get(key: string): number;
}

export interface RadioQuestionnairePayload {
  mental: number;
  physical: number;
  temporal: number;
  performance: number;
  effort: number;
  frustation: number;
}

export type UIType =
  | "matrix"
  | "radio"
  | "login"
  | "results"
  | "setup"
  | "matrixtour"
  | "radiotour";

export interface UserInfo {
  name: string;
  rollno: string;
  age: number;
}

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

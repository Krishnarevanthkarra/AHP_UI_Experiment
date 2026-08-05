// Saaty's Random Index table (average CI of random matrices), n = 1..10
const RANDOM_INDEX: Record<number, number> = {
  1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49
};

export interface ScaleOption {
  label: string;
  value: number;
}

// The 1-9 Saaty scale, in dropdown order from 1/9 up to 9.
export function buildScale(): ScaleOption[] {
  const scale: ScaleOption[] = [];
  for (let v = 9; v >= 2; v--) scale.push({ label: `1/${v}`, value: 1 / v });
  scale.push({ label: '1', value: 1 });
  for (let v = 2; v <= 9; v++) scale.push({ label: String(v), value: v });
  return scale;
}

export interface AHPResult {
  weights: number[];
  lambdaMax: number;
  CI: number;
  CR: number;
}

// Given an n x n reciprocal matrix, return weights + consistency stats
// using the standard normalize-columns / average-rows approximation.
export function computeAHP(matrix: number[][]): AHPResult {
  const n = matrix.length;
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) colSums[j] += matrix[i][j];
  }
  const normalized = matrix.map(row => row.map((v, j) => v / colSums[j]));
  const weights = normalized.map(row => row.reduce((a, b) => a + b, 0) / n);

  const weightedSum = matrix.map(row => row.reduce((sum, v, j) => sum + v * weights[j], 0));
  const consistencyVec = weightedSum.map((v, i) => v / weights[i]);
  const lambdaMax = consistencyVec.reduce((a, b) => a + b, 0) / n;

  const CI = n > 2 ? (lambdaMax - n) / (n - 1) : 0;
  const RI = RANDOM_INDEX[n] ?? 1.49;
  const CR = n > 2 && RI > 0 ? CI / RI : 0;

  return { weights, lambdaMax, CI, CR };
}

// Build an n x n reciprocal matrix from an upper-triangle value map.
export function matrixFromUpper(n: number, upper: number[][]): number[][] {
  const m: number[][] = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const v = upper[i][j] ?? 1;
      m[i][j] = v;
      m[j][i] = 1 / v;
    }
  }
  return m;
}

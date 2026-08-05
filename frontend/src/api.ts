import { MatrixEventPayload, RadioEventPayload } from './types';

async function postJSON(url: string, body: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    // Logging is best-effort — a dropped event shouldn't block the user
    // from continuing their comparison.
    console.warn('Failed to reach API', url, e);
  }
}

export function logMatrixEvent(payload: MatrixEventPayload): Promise<void> {
  return postJSON('/api/matrix/event', payload);
}

export function logRadioEvent(payload: RadioEventPayload): Promise<void> {
  return postJSON('/api/radio/event', payload);
}

# AHP Priority Console — React + TypeScript + FastAPI + MongoDB

Two pairwise-comparison UIs for the Analytic Hierarchy Process (AHP):

1. **Matrix Grid** — an N×N table, upper triangle editable (1–9 Saaty scale
   or its reciprocal), diagonal fixed at 1, lower triangle auto-filled as
   the reciprocal.
2. **Pairwise Radio** — one row per criterion pair. No "Equal" choice: the
   user must pick which criterion wins, and only then does the 1–9
   intensity scale unlock for that pair.

Flow: **Login** (name, roll no., age, mandatory terms & conditions
checkbox) → **Setup** (pick a UI, list criteria) → **Compare** (Matrix or
Radio) → **Results** (weights + consistency ratio). Light/dark theme is
toggleable from the header at all times. The timer that feeds each click's
`timer` value starts silently the moment Start is pressed — it is never
displayed on the comparison screens, only used for logging.

## Stack

- **Frontend**: React 18 + TypeScript, built with Vite (`frontend/`)
- **Backend**: Python + FastAPI + PyMongo (`backend/`)
- **DB**: MongoDB, two collections

## Data model

Two collections, kept deliberately narrow so a plain CSV export needs no
massaging — every document is flat, same field set in both:

```
name               string   — from the login form
rollno             string   — from the login form
age                int      — from the login form
clicknumber        int      — running click counter for this user's session
timer              float    — seconds since Start, at this click
cr                 float    — consistency ratio right after this click
option             string   — which option was touched, e.g. "Social-Environmental"
                              (radio adds a "-winner" / "-value" suffix)
value              number/string — the value chosen (matrix: 1/9..9, radio: text)
option_vote_count  int      — how many times THIS option has been changed
                              by this user so far (their revisit count)
```

- `matrix_responses` — one document per matrix-cell edit
- `radio_responses` — one document per radio click (winner pick or
  intensity pick, logged separately)

No nested arrays or objects, so it's a one-to-one mapping to CSV rows.

## Exporting to CSV

Two ways:

1. **Built-in endpoints** (simplest — no separate tools):
   - `GET /api/matrix/export.csv`
   - `GET /api/radio/export.csv`

   Open either URL in a browser (or `curl`) and it downloads directly.

2. **mongoexport**, if you'd rather go straight from MongoDB:
   ```bash
   mongoexport --db=ahp_tracker --collection=matrix_responses --type=csv \
     --fields=name,rollno,age,clicknumber,timer,cr,option,value,option_vote_count \
     --out=matrix_responses.csv

   mongoexport --db=ahp_tracker --collection=radio_responses --type=csv \
     --fields=name,rollno,age,clicknumber,timer,cr,option,value,option_vote_count \
     --out=radio_responses.csv
   ```

## Run it

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# make sure mongod is running locally, e.g.:
#   mongod --dbpath /path/to/your/data/db
uvicorn main:app --reload
```

Backend runs at http://localhost:8000 (Swagger docs at `/docs`).

Environment variables (optional): `MONGO_URL` (default
`mongodb://127.0.0.1:27017`), `DB_NAME` (default `ahp_tracker`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173. The Vite dev server proxies `/api/*` to
`http://localhost:8000`, so no CORS setup is needed in dev (the backend
also allows all origins for convenience — tighten `allow_origins` in
`backend/main.py` before deploying).

## AHP math

`frontend/src/ahp.ts` implements the standard approximate method:
normalize each column of the reciprocal matrix, average each row for the
priority vector, then derive λmax, CI = (λmax − n)/(n − 1), and
CR = CI / RI using Saaty's Random Index table. CR < 0.10 is treated as
acceptable and gates the Finish button on both UIs.

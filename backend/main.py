import csv
import io
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://127.0.0.1:27017")
DB_NAME = os.environ.get("DB_NAME", "ahp_tracker")

app = FastAPI(title="AHP Priority Console API")

# Dev-friendly CORS so the Vite dev server (http://localhost:5173) can call
# this API directly. Tighten allow_origins for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
matrix_responses = db["matrix_responses"]
radio_responses = db["radio_responses"]

# Flat, minimal, CSV-friendly schema — same field set for both collections,
# just interpreted per UI. No nested objects, so `mongoexport --type=csv`
# or the /export.csv endpoints below work with zero massaging.
FIELDS = ["name", "rollno", "age", "clicknumber", "timer", "cr", "option", "value", "option_vote_count"]


class MatrixEvent(BaseModel):
    name: str = Field(..., min_length=1)
    rollno: str = Field(..., min_length=1)
    age: int = Field(..., gt=0, lt=130)
    clicknumber: int
    timer: float          # seconds since the user hit Start, up to this click
    cr: float              # consistency ratio after this click
    option: str             # which cell changed, e.g. "Social-Environmental"
    value: float             # the value chosen for that cell
    option_vote_count: int    # how many times THIS option has been changed so far (revisit count)


class RadioEvent(BaseModel):
    name: str = Field(..., min_length=1)
    rollno: str = Field(..., min_length=1)
    age: int = Field(..., gt=0, lt=130)
    clicknumber: int
    timer: float
    cr: float
    option: str              # e.g. "Social-Environmental-winner" or "...-value"
    value: str                # the radio option chosen, as text
    option_vote_count: int


@app.post("/api/matrix/event")
def log_matrix_event(payload: MatrixEvent):
    matrix_responses.insert_one(payload.model_dump())
    return {"ok": True}


@app.post("/api/radio/event")
def log_radio_event(payload: RadioEvent):
    radio_responses.insert_one(payload.model_dump())
    return {"ok": True}


def stream_csv(collection, filename: str) -> StreamingResponse:
    def generate():
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=FIELDS, extrasaction="ignore")
        writer.writeheader()
        yield buf.getvalue()
        buf.seek(0)
        buf.truncate(0)
        for doc in collection.find({}, {"_id": 0}):
            writer.writerow(doc)
            yield buf.getvalue()
            buf.seek(0)
            buf.truncate(0)

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@app.get("/api/matrix/export.csv")
def export_matrix_csv():
    return stream_csv(matrix_responses, "matrix_responses.csv")


@app.get("/api/radio/export.csv")
def export_radio_csv():
    return stream_csv(radio_responses, "radio_responses.csv")


@app.get("/api/health")
def health():
    return {"ok": True}

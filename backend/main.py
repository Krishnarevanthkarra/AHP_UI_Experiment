import csv
import io
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient
from settings import settings

MONGO_USERNAME = settings.MONGO_USERNAME
MONGO_PASSWORD = settings.MONGO_PASSWORD
MONGO_CLUSTER = settings.MONGO_CLUSTER

MONGO_URL = f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_CLUSTER}.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = settings.DB_NAME

app = FastAPI(title="AHP Priority Console API")
# Dev-friendly CORS so the Vite dev server (http://localhost:5173) can call
# this API directly. Tighten allow_origins for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print(settings.FRONTEND)

client = MongoClient(MONGO_URL)
db = client.get_database(DB_NAME)
matrix_responses = db["matrix_responses"]
radio_responses = db["radio_responses"]
matrix_survey = db["matrix_survey"]
radio_survey = db["radio_survey"]

# Flat, minimal, CSV-friendly schema — same field set for both collections,
# just interpreted per UI. No nested objects, so `mongoexport --type=csv`
# or the /export.csv endpoints below work with zero massaging.
FIELDS = [
    "name",
    "rollno",
    "age",
    "clicknumber",
    "timer",
    "cr",
    "option",
    "value",
    "option_vote_count",
]


class MatrixEvent(BaseModel):
    name: str = Field(..., min_length=1)
    education: str = Field(..., min_length=1)
    age: int = Field(..., gt=0, lt=130)
    clicknumber: int
    timer: float  # seconds since the user hit Start, up to this click
    cr: float  # consistency ratio after this click
    option: str  # which cell changed, e.g. "Social-Environmental"
    value: float  # the value chosen for that cell
    option_vote_count: (
        int  # how many times THIS option has been changed so far (revisit count)
    )


class RadioEvent(BaseModel):
    name: str = Field(..., min_length=1)
    education: str = Field(..., min_length=1)
    age: int = Field(..., gt=0, lt=130)
    clicknumber: int
    timer: float
    cr: float
    option: str  # e.g. "Social-Environmental-winner" or "...-value"
    value: str  # the radio option chosen, as text
    option_vote_count: int


class MatrixSurvey(BaseModel):
    name: str = Field(..., min_length=1)
    education: str = Field(..., min_length=1)
    age: int = Field(..., gt=0, lt=130)
    mental: int
    physical: int
    temporal: int
    performance: int
    effort: int
    frustation: int


class RadioSurvey(MatrixSurvey): ...


@app.post("/api/matrix/event")
def log_matrix_event(payload: MatrixEvent):
    matrix_responses.insert_one(payload.model_dump())
    return {"ok": True}


@app.post("/api/radio/event")
def log_radio_event(payload: RadioEvent):
    radio_responses.insert_one(payload.model_dump())
    return {"ok": True}


@app.post("/api/matrix_survey")
def log_matrix_survey(payload: MatrixSurvey):
    matrix_survey.insert_one(payload.model_dump())
    return {"ok": True}


@app.post("/api/radio_survey")
def log_radio_survey(payload: RadioSurvey):
    radio_survey.insert_one(payload.model_dump())
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

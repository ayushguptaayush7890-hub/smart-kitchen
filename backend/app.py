from io import BytesIO
from pathlib import Path
from typing import List, Optional, Tuple

import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from ultralytics import YOLO
import os
import json

try:
    import google.generativeai as genai  # type: ignore
except Exception:
    genai = None


BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"
RECIPES_CSV = DATASET_DIR / "recipes_5000_dataset.csv"

# ---------- Load recipes dataset into memory ----------
if not RECIPES_CSV.exists():
    raise RuntimeError(f"Recipes dataset not found at {RECIPES_CSV}")

_recipes_df = pd.read_csv(RECIPES_CSV)
required_cols = {"id", "name", "ingredients", "steps", "cooking_time", "difficulty", "image"}
missing = required_cols - set(_recipes_df.columns)
if missing:
    raise RuntimeError(f"recipes_5000_dataset.csv missing required columns: {missing}")

_recipes_df["id"] = _recipes_df["id"].astype(str)


def _norm(text: str) -> str:
    return (text or "").strip().lower()


def _split_ingredients(ing: str) -> List[str]:
    if not isinstance(ing, str):
        return []
    return [_norm(t) for t in ing.split("|") if _norm(t)]


# ---------- Load YOLOv8 classification model ----------
MODEL_PATH = BASE_DIR / "model" / "best.pt"
if not MODEL_PATH.exists():
    raise RuntimeError(f"Model file not found at {MODEL_PATH}")

yolo_model = YOLO(str(MODEL_PATH))


# ---------- FastAPI app ----------
app = FastAPI(title="CookMate AI – Full Backend (Recipes + YOLOv8)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict:
    return {"message": "CookMate AI backend running"}


# ---------- Recipes ----------
@app.get("/recipes")
async def list_recipes(limit: int = 10) -> List[dict]:
    limit = max(1, min(int(limit), 50))
    sample = _recipes_df.sample(n=limit, replace=False, random_state=None)
    return sample.to_dict(orient="records")


@app.post("/search")
async def search_recipes(payload: dict) -> List[dict]:
    ingredients = payload.get("ingredients")
    if not isinstance(ingredients, list) or not ingredients:
        raise HTTPException(
            status_code=400,
            detail="Request body must include a non-empty 'ingredients' list.",
        )

    user_ings = [_norm(i) for i in ingredients if _norm(i)]
    if not user_ings:
        return []

    user_set = set(user_ings)

    def match_score(row: pd.Series) -> int:
        recipe_set = set(_split_ingredients(row.get("ingredients", "")))
        return len(user_set & recipe_set)

    df = _recipes_df.copy()
    df["score"] = df.apply(match_score, axis=1)
    df = df[df["score"] > 0]
    if df.empty:
        return []

    # Randomize order within same relevance, then take top 10
    df = df.sample(frac=1.0, random_state=None)
    df = df.sort_values(by="score", ascending=False, kind="mergesort")
    df = df.head(10)
    return df.drop(columns=["score"]).to_dict(orient="records")


@app.get("/recipe/{recipe_id}")
async def get_recipe(recipe_id: str) -> dict:
    sub = _recipes_df[_recipes_df["id"] == str(recipe_id)]
    if sub.empty:
        raise HTTPException(status_code=404, detail="Recipe not found.")
    return sub.iloc[0].to_dict()


# ---------- Robot Chef (simple, no external API) ----------
@app.post("/chef")
async def chef_assistant(payload: dict) -> dict:
    recipe_id = payload.get("recipe_id")
    if recipe_id is None:
        raise HTTPException(status_code=400, detail="Request body must include 'recipe_id'.")

    sub = _recipes_df[_recipes_df["id"] == str(recipe_id)]
    if sub.empty:
        raise HTTPException(status_code=404, detail="Recipe not found.")

    row = sub.iloc[0]
    raw_steps = str(row.get("steps") or "").split("|")
    clean_steps = [s.strip() for s in raw_steps if s and str(s).strip()]

    recipe_name = str(row.get("name") or f"Recipe {recipe_id}")

    instructions, tip = _generate_chef_instructions(recipe_name, clean_steps)

    return {"recipe": recipe_name, "instructions": instructions, "tip": tip}


# ---------- YOLOv8 classification ----------
@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> JSONResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Validate + read image
    try:
        contents = await file.read()
        image = Image.open(BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    # Run classification inference
    try:
        results = yolo_model(image)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model inference error: {exc}")

    if not results:
        raise HTTPException(status_code=500, detail="No prediction returned from model.")

    result = results[0]
    probs = getattr(result, "probs", None)
    if probs is None or probs.top1 is None:
        raise HTTPException(status_code=500, detail="Model did not return classification probabilities.")

    class_id = int(probs.top1)
    confidence: Optional[float] = float(probs.top1conf) if probs.top1conf is not None else None
    name_map = getattr(result, "names", None) or {}
    predicted_class = str(name_map.get(class_id, class_id))

    return JSONResponse(
        {
            "predicted_class": predicted_class,
            "confidence_score": round(confidence, 4) if confidence is not None else None,
        }
    )


def _generate_chef_instructions(recipe_name: str, steps: List[str]) -> Tuple[List[str], str]:
    """
    If GEMINI_API_KEY is set and google-generativeai is installed, use Gemini
    to generate friendly instructions + one cooking tip.
    Otherwise fall back to a deterministic formatting of CSV steps.
    """
    # Fallback (always works)
    fallback_instructions = [f"Step {i}: {step}." for i, step in enumerate(steps, start=1)]
    fallback_tip = "Keep the heat on medium and prep your ingredients before you start."

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return fallback_instructions, fallback_tip

    try:
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_CHEF_MODEL", "gemini-1.5-flash")
        model = genai.GenerativeModel(model_name)

        prompt = (
            "You are a friendly robot chef.\n"
            "Rewrite the following recipe steps into clear, encouraging, step-by-step instructions.\n"
            "Keep each step short and actionable.\n"
            "Also provide exactly ONE cooking tip.\n\n"
            "Return ONLY valid JSON with this exact shape:\n"
            "{\n"
            '  \"instructions\": [\"...\", \"...\"],\n'
            '  \"tip\": \"...\"\n'
            "}\n\n"
            f"Recipe name: {recipe_name}\n"
            f"Steps: {json.dumps(steps, ensure_ascii=False)}\n"
        )

        resp = model.generate_content(prompt)
        text = (resp.text or "").strip()
        data = json.loads(text)

        instructions = data.get("instructions")
        tip = data.get("tip")
        if not isinstance(instructions, list) or not all(isinstance(x, str) for x in instructions):
            return fallback_instructions, fallback_tip
        if not isinstance(tip, str) or not tip.strip():
            tip = fallback_tip

        cleaned = [x.strip() for x in instructions if x.strip()]
        return (cleaned or fallback_instructions), tip.strip()
    except Exception:
        return fallback_instructions, fallback_tip


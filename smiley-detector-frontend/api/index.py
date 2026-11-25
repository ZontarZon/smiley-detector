import onnxruntime as ort
import logging
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image as PImage
from io import BytesIO
from pathlib import Path

# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "model_2.onnx"

model = ort.InferenceSession(
    str(MODEL_PATH),
    providers=["CPUExecutionProvider"]
)

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)

# Create FastAPI instance with custom docs
app = FastAPI(docs_url="/api/py/docs", debug=True)

# @Source: https://betterstack.com/community/guides/scaling-python/uploading-files-using-fastapi/
@app.post("/api/py/predict")
async def predict(file: UploadFile = File(...)):
    if file.filename == "":
        raise HTTPException(status_code=400, detail="No file selected")
    try:
        # I'd love to use keras here, but tensorflow is too chunky.
        contents = await file.read()
        img = PImage.open(BytesIO(contents)).convert("RGB")
        img = np.array(img)
        img = np.asarray(img, dtype="uint8")
        img = np.expand_dims(img, axis=0)
        input_name = model.get_inputs()[0].name

        pred = model.run(
            None,
            {
                input_name: np.asarray(img, dtype=np.float32)
            }
        )[0]
        return(pred.tolist())
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
import keras
import tensorflow as tf
import logging
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image as PImage
from io import BytesIO
from pathlib import Path


# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

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
        model = keras.models.load_model('models/model_2.keras')
        contents = await file.read()
        img = PImage.open(BytesIO(contents)).convert("RGB")
        img = np.array(img)
        logger.debug(file)
        img = tf.convert_to_tensor(img, dtype=tf.uint8)
        img = tf.expand_dims(img, axis=0)
        pred = model.predict(img)
        return(pred.tolist())
    except Exception as e:
        logger.debug(e)
        return(e)
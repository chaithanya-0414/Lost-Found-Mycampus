import torch
import torch.nn as nn
import torchvision.models as models
from PIL import Image
import io
from fastapi import FastAPI, UploadFile, File
import numpy as np
from utils.image_preprocessing import get_preprocess
from utils.similarity import cosine_similarity
from collections import Counter

app = FastAPI()

# Load pre-trained ResNet18 model
model = models.resnet18(pretrained=True)
feature_extractor = torch.nn.Sequential(*(list(model.children())[:-1]))
feature_extractor.eval()

preprocess = get_preprocess()

def extract_dominant_color(image: Image):
    # Resize to speed up
    img = image.copy()
    img.thumbnail((50, 50))
    pixels = list(img.getdata())
    # Find most common color
    color_counts = Counter(pixels)
    dominant_color = color_counts.most_common(1)[0][0]
    return dominant_color # (R, G, B)

@app.get("/")
def read_root():
    return {"message": "AI Matching Engine v2.0 - Active"}

@app.post("/extract-features")
async def extract_features(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    
    # Extract dominant color
    dom_color = extract_dominant_color(image)
    
    # Preprocess for ResNet
    img_tensor = preprocess(image)
    img_tensor = img_tensor.unsqueeze(0) 
    
    # Extract features
    with torch.no_grad():
        features = feature_extractor(img_tensor)
    
    # Flatten and convert to list
    features = features.squeeze().numpy().tolist()
    
    # Simple classification for category ID
    with torch.no_grad():
        output = model(img_tensor)
        _, predicted = torch.max(output, 1)
        category_id = int(predicted.item())

    return {
        "features": features, 
        "category_id": category_id,
        "dominant_color": dom_color,
        "model": "resnet18-v2"
    }

@app.post("/similarity")
async def compute_similarity(vector1: list, vector2: list):
    similarity = cosine_similarity(vector1, vector2)
    return {"similarity": similarity}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

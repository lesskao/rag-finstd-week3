from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.term_service import term_service
from app.services.file_service import file_service
from app.services.import_service import import_service

router = APIRouter()

class SearchRequest(BaseModel):
    text: str
    top_k: Optional[int] = 5

class StandardizeRequest(BaseModel):
    text: str

class ImportRequest(BaseModel):
    source: str
    type: str = "url" # or "api"

@router.post("/terms/init")
async def initialize_terms():
    result = term_service.load_initial_data()
    return result

@router.post("/terms/search")
async def search_terms(request: SearchRequest):
    results = term_service.find_similar_terms(request.text, request.top_k)
    return {"results": results}

@router.post("/standardize/text")
async def standardize_text(request: StandardizeRequest):
    result = term_service.standardize_text(request.text)
    return result

@router.post("/import/external")
async def import_external(request: ImportRequest):
    if request.type == "url":
        return import_service.import_from_url(request.source)
    elif request.type == "api":
        return import_service.import_from_api(request.source)
    else:
        raise HTTPException(status_code=400, detail="Unsupported import type")

@router.post("/process/file")
async def process_file(file: UploadFile = File(...)):
    result = await file_service.process_file(file)
    return result

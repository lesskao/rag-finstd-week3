import os

class Settings:
    MILVUS_HOST = os.getenv("MILVUS_HOST", "localhost")
    MILVUS_PORT = os.getenv("MILVUS_PORT", "19530")
    COLLECTION_NAME = "financial_terms"
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    DATA_DIR = "d:/ai/gientech/code/rag-finstd-week3/data"

settings = Settings()

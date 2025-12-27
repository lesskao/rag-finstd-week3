from pymilvus import (
    connections,
    FieldSchema,
    CollectionSchema,
    DataType,
    Collection,
    utility
)
from app.core.config import settings

class MilvusService:
    def __init__(self):
        self.connect()
        self.collection_name = settings.COLLECTION_NAME
        self.dim = 384  # Dimension for all-MiniLM-L6-v2

    def connect(self):
        connections.connect("default", host=settings.MILVUS_HOST, port=settings.MILVUS_PORT)

    def create_collection(self):
        if utility.has_collection(self.collection_name):
            return Collection(self.collection_name)

        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="term", dtype=DataType.VARCHAR, max_length=512),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=self.dim),
            FieldSchema(name="type", dtype=DataType.VARCHAR, max_length=64),
        ]
        schema = CollectionSchema(fields, "Financial Terminology Collection")
        collection = Collection(self.collection_name, schema)
        
        index_params = {
            "metric_type": "L2",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 1024}
        }
        collection.create_index(field_name="embedding", index_params=index_params)
        return collection

    def insert_terms(self, terms, embeddings, types):
        collection = Collection(self.collection_name)
        entities = [
            terms,
            embeddings,
            types
        ]
        collection.insert(entities)
        collection.flush()

    def search_similar(self, query_vectors, top_k=1):
        collection = Collection(self.collection_name)
        collection.load()
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
        results = collection.search(
            data=query_vectors,
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["term", "type"]
        )
        return results

    def drop_collection(self):
         if utility.has_collection(self.collection_name):
            utility.drop_collection(self.collection_name)

milvus_service = MilvusService()

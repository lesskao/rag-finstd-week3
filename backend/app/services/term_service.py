import pandas as pd
import re
from sentence_transformers import SentenceTransformer
from app.services.milvus_service import milvus_service
from app.core.config import settings
import os

class TermService:
    def __init__(self):
        self.model = SentenceTransformer(settings.EMBEDDING_MODEL)

    def load_initial_data(self):
        csv_path = os.path.join(settings.DATA_DIR, "finstd10K.csv")
        if not os.path.exists(csv_path):
            print(f"Data file not found: {csv_path}")
            return {"status": "error", "message": "Data file not found"}

        # Read CSV
        # Assuming format: Term, Type (lines 1+ are data)
        try:
            df = pd.read_csv(csv_path, header=None, names=["Term", "Type"])
            # Skip the first row if it looks like a header (it was A, FINTERM which matched the data pattern but 'A' is also a word)
            # Actually line 1 'A,FINTERM' is Term: A, Type: FINTERM. 'A' is a valid term.
            # But let's check duplicates
            df = df.drop_duplicates(subset=["Term"])
            
            terms = df["Term"].astype(str).tolist()
            types = df["Type"].astype(str).tolist()

            # Create Collection
            milvus_service.drop_collection() # Reset for now
            milvus_service.create_collection()

            # Embed in batches
            batch_size = 500
            total = len(terms)
            print(f"Embedding {total} terms...")
            
            for i in range(0, total, batch_size):
                batch_terms = terms[i:i+batch_size]
                batch_types = types[i:i+batch_size]
                embeddings = self.model.encode(batch_terms)
                
                milvus_service.insert_terms(batch_terms, embeddings, batch_types)
                print(f"Inserted batch {i} to {i+batch_size}")

            return {"status": "success", "count": total}

        except Exception as e:
            print(f"Error loading data: {e}")
            return {"status": "error", "message": str(e)}

    def find_similar_terms(self, text, top_k=5):
        embedding = self.model.encode([text])
        results = milvus_service.search_similar(embedding, top_k=top_k)
        
        matches = []
        for hits in results:
            for hit in hits:
                matches.append({
                    "term": hit.entity.get("term"),
                    "type": hit.entity.get("type"),
                    "score": hit.distance
                })
        return matches

    def standardize_text(self, text: str):
        # 1. Break text into potential term candidates (simplistic: by words/phrases)
        # In a real system, we'd use an NLP library like spaCy to extract entities/noun phrases
        # Here we'll do a simple window-based approach for common financial terms
        
        words = re.findall(r'\b\w+(?:-\w+)*\b', text)
        standardized_text = text
        all_matches = []

        # We look for matches for each word to see if it's a known term but maybe slightly different
        # To avoid performance issues, we batch search or only search unique capitalized words
        candidates = list(set([w for w in words if len(w) > 2]))
        
        if not candidates:
            return {"standardized_text": text, "matches": []}

        # Embed all candidates
        embeddings = self.model.encode(candidates)
        
        # Search Milvus for each
        results = milvus_service.search_similar(embeddings, top_k=1)
        
        replacements = {}
        for i, hits in enumerate(results):
            if hits:
                hit = hits[0]
                # If similarity is high enough (L2 distance is low)
                # Note: L2 distance closer to 0 is more similar. 
                # For MiniLM, distance < 0.5 usually means very similar.
                if hit.distance < 0.8: 
                    original = candidates[i]
                    standard = hit.entity.get("term")
                    if original != standard:
                        replacements[original] = standard
                        all_matches.append({
                            "original": original,
                            "standard": standard,
                            "type": hit.entity.get("type"),
                            "confidence": 1 - (hit.distance / 2) # Rough approximation
                        })

        # Apply replacements (simplistic)
        for original, standard in replacements.items():
            # Use regex to replace only whole words
            standardized_text = re.sub(rf'\b{re.escape(original)}\b', standard, standardized_text)

        return {
            "original_text": text,
            "standardized_text": standardized_text,
            "matches": all_matches
        }

term_service = TermService()

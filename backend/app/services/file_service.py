import os
from fastapi import UploadFile
from pypdf import PdfReader
import markdown
import json
from langchain_text_splitters import RecursiveCharacterTextSplitter

class FileService:
    def __init__(self):
        self.upload_dir = "uploaded_files"
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            length_function=len,
        )

    async def save_file(self, file: UploadFile):
        file_path = os.path.join(self.upload_dir, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        return file_path

    def parse_pdf(self, file_path):
        reader = PdfReader(file_path)
        text_content = []
        tables = []
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                text_content.append({"page": i+1, "content": text})
            
            # Placeholder for table extraction logic (requires complex libraries like camelot or tabula)
            # In a real scenario, we'd integrate OCR or table detection models here.
            
        return {
            "type": "pdf",
            "text_structure": text_content,
            "metadata": reader.metadata
        }

    def parse_markdown(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read()
            
        html = markdown.markdown(text, extensions=['tables'])
        # Simple structure parsing (splitting by headers)
        lines = text.split('\n')
        structure = []
        current_section = "Root"
        current_content = []
        
        for line in lines:
            if line.startswith('#'):
                if current_content:
                    structure.append({"section": current_section, "content": "\n".join(current_content)})
                    current_content = []
                current_section = line.strip()
            else:
                current_content.append(line)
                
        if current_content:
             structure.append({"section": current_section, "content": "\n".join(current_content)})

        return {
            "type": "markdown",
            "structure": structure
        }

    async def process_file(self, file: UploadFile, chunk: bool = True):
        path = await self.save_file(file)
        ext = file.filename.split('.')[-1].lower()
        
        result = {}
        if ext == 'pdf':
            result = self.parse_pdf(path)
        elif ext in ['md', 'markdown']:
            result = self.parse_markdown(path)
        else:
            return {"error": "Unsupported file type yet"}
        
        if chunk:
            # Combine text content from result to chunk it
            full_text = ""
            if ext == 'pdf':
                full_text = "\n".join([item['content'] for item in result.get('text_structure', [])])
            elif ext in ['md', 'markdown']:
                full_text = "\n".join([item['content'] for item in result.get('structure', [])])
            
            chunks = self.text_splitter.split_text(full_text)
            result['chunks'] = chunks
            
        return result

file_service = FileService()

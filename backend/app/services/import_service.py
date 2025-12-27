import requests
from bs4 import BeautifulSoup
from typing import Dict, Any

class ImportService:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def import_from_url(self, url: str) -> Dict[str, Any]:
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Get title and text
            title = soup.title.string if soup.title else ""
            text = soup.get_text(separator='\n')
            
            # Simple cleaning
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            clean_text = '\n'.join(lines)

            return {
                "source": url,
                "title": title,
                "content": clean_text,
                "status": "success"
            }
        except Exception as e:
            return {
                "source": url,
                "status": "error",
                "message": str(e)
            }

    def import_from_api(self, endpoint: str, method: str = "GET", params: Dict = None, headers: Dict = None) -> Dict[str, Any]:
        try:
            if method.upper() == "GET":
                response = requests.get(endpoint, params=params, headers=headers)
            else:
                response = requests.post(endpoint, json=params, headers=headers)
            
            response.raise_for_status()
            return {
                "source": endpoint,
                "content": response.json(),
                "status": "success"
            }
        except Exception as e:
            return {
                "source": endpoint,
                "status": "error",
                "message": str(e)
            }

import_service = ImportService()

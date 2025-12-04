import google.generativeai as genai
from ..config.settings import config
import json

if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None

def extract_budget_from_excel(file_content: str, file_data: dict) -> dict:
    if not model:
        return {'error': 'Gemini API key not configured'}

    try:
        prompt = f"""
        You are a financial data extraction assistant. Extract budget information from the following Excel data.

        Excel Data:
        {file_data}

        Please extract and return a JSON object with the following structure:
        {{
            "items": [
                {{
                    "category": "category name",
                    "amount": numeric_amount,
                    "description": "item description",
                    "type": "CAPEX or OPEX"
                }}
            ],
            "total": total_amount,
            "summary": "brief summary of the budget"
        }}

        Return only valid JSON, no additional text.
        """

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        return json.loads(result_text)
    except Exception as e:
        return {'error': f'Failed to extract budget data: {str(e)}'}

def generate_rationalization_suggestions(justification: str, amount: float, category: str) -> list:
    if not model:
        return []

    try:
        prompt = f"""
        Generate 3 professional rationalization suggestions for a budget request with the following details:

        Category: {category}
        Amount: ${amount:,.2f}
        Current Justification: {justification}

        Provide suggestions that strengthen the business case. Return as a JSON array of strings.
        Return only valid JSON, no additional text.
        """

        response = model.generate_content(prompt)
        result_text = response.text.strip()

        if result_text.startswith('```json'):
            result_text = result_text[7:]
        if result_text.endswith('```'):
            result_text = result_text[:-3]
        result_text = result_text.strip()

        return json.loads(result_text)
    except Exception:
        return []

def summarize_budget_request(request_data: dict) -> str:
    if not model:
        return "Summary generation unavailable"

    try:
        prompt = f"""
        Create a brief executive summary (2-3 sentences) for this budget request:

        Type: {request_data.get('type')}
        Category: {request_data.get('category')}
        Amount: ${request_data.get('amount', 0):,.2f}
        Justification: {request_data.get('justification')}

        Focus on business value and impact. Be concise and professional.
        """

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return "Summary generation failed"

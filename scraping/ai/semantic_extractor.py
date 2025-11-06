"""
AI-Powered Semantic Data Extraction
Uses Datapizza AI or Google Generative AI to understand and extract data from scraped pages
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class SemanticExtractor:
    """
    Uses AI to semantically understand and extract structured data from HTML

    Features:
    - Adapts to any HTML structure (no hardcoded selectors)
    - Extracts structured property information
    - Validates data quality
    - Returns confidence scores
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-pro"):
        """
        Initialize Semantic Extractor

        Args:
            api_key: Google AI API key (or from env GOOGLE_API_KEY)
            model: Model to use (default: gemini-1.5-pro)
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.model = model
        self.client = None

        if not self.api_key:
            logger.warning("No GOOGLE_API_KEY provided, AI extraction will not work")
            return

        # Try to use Datapizza AI first, fallback to google-generativeai
        try:
            from datapizza.ai import Agent
            from datapizza.clients.google import GoogleClient

            self.client_type = "datapizza"
            self.client = GoogleClient(
                api_key=self.api_key,
                model=self.model,
            )

            # Create extraction agent
            self.agent = Agent(
                name="property_extractor",
                client=self.client,
                instructions=self._get_extraction_instructions(),
            )

            logger.info("Datapizza AI initialized successfully")

        except ImportError:
            logger.info("Datapizza AI not available, using google-generativeai directly")

            try:
                import google.generativeai as genai

                self.client_type = "google"
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model)

                logger.info("Google Generative AI initialized successfully")

            except ImportError:
                logger.error("Neither Datapizza AI nor google-generativeai available")
                self.client = None

    def _get_extraction_instructions(self) -> str:
        """Get instructions for AI agent"""
        return """
You are an expert real estate data extractor for Italian properties.

Extract structured property information from HTML/text with high accuracy.

ALWAYS extract these fields (use null if not found):
- title: Property title/headline
- price: Numeric only, no currency symbols (convert to float)
- location: City, zone, address if available
- propertyType: appartamento, casa, villa, ufficio, etc.
- contractType: vendita, affitto, etc.
- sqm: Square meters (numeric)
- rooms: Number of rooms/locali (integer)
- bathrooms: Number of bathrooms (integer)
- features: Object with:
  - hasElevator: boolean
  - hasParking: boolean
  - hasGarden: boolean
  - hasTerrace: boolean
  - hasGarage: boolean
- condition: nuovo, buono, da ristrutturare, etc.
- energyClass: A+, A, B, C, etc.
- floor: Floor number if apartment
- description: Full description text
- images: Array of image URLs

Return ONLY valid JSON, no markdown formatting.
Be precise and accurate.
If a field is genuinely not found, use null.
"""

    async def extract_property_data(
        self,
        html: str,
        url: str,
        context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Extract structured property data from HTML using AI

        Args:
            html: HTML content
            url: Source URL
            context: Additional context for extraction

        Returns:
            Structured property data dictionary
        """
        if not self.client:
            logger.error("AI client not initialized, cannot extract")
            return {
                "error": "AI client not available",
                "source_url": url,
            }

        try:
            # Truncate HTML if too long (token limit)
            max_length = 30000
            if len(html) > max_length:
                html = html[:max_length] + "\n... [truncated]"
                logger.debug(f"HTML truncated to {max_length} chars")

            # Build prompt
            prompt = f"""
Extract property data from this HTML:

Source URL: {url}
{f'Context: {context}' if context else ''}

HTML:
{html}

Return JSON with property details following the schema.
"""

            # Call AI
            if self.client_type == "datapizza":
                response = await self._extract_with_datapizza(prompt)
            elif self.client_type == "google":
                response = await self._extract_with_google(prompt)
            else:
                return {"error": "No AI client available"}

            # Add metadata
            response["source_url"] = url
            response["extraction_method"] = "ai_semantic"
            response["model"] = self.model

            logger.info(f"Successfully extracted property data from {url}")
            return response

        except Exception as e:
            logger.error(f"AI extraction failed: {e}")
            return {
                "error": str(e),
                "source_url": url,
            }

    async def _extract_with_datapizza(self, prompt: str) -> Dict[str, Any]:
        """Extract using Datapizza AI"""
        try:
            response = await self.agent.run(prompt)

            # Parse output
            output = response.get("output", {})

            # If output is string, try to parse as JSON
            if isinstance(output, str):
                try:
                    output = json.loads(output)
                except:
                    # If parsing fails, wrap in object
                    output = {"raw_text": output}

            # Add confidence score if available
            if "confidence" in response:
                output["confidence_score"] = response["confidence"]
            else:
                output["confidence_score"] = 0.8  # Default

            return output

        except Exception as e:
            logger.error(f"Datapizza extraction error: {e}")
            raise

    async def _extract_with_google(self, prompt: str) -> Dict[str, Any]:
        """Extract using Google Generative AI directly"""
        try:
            response = await asyncio.to_thread(
                self.client.generate_content,
                prompt
            )

            # Extract text
            text = response.text

            # Try to parse as JSON
            try:
                # Remove markdown code blocks if present
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()

                data = json.loads(text)

                # Add default confidence
                data["confidence_score"] = 0.8

                return data

            except json.JSONDecodeError as e:
                logger.warning(f"Could not parse JSON from AI response: {e}")
                return {
                    "raw_text": text,
                    "error": "json_parse_error",
                    "confidence_score": 0.5,
                }

        except Exception as e:
            logger.error(f"Google AI extraction error: {e}")
            raise

    async def validate_extracted_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate extracted data using AI

        Args:
            data: Extracted data dictionary

        Returns:
            Validation result with errors and warnings
        """
        if not self.client:
            return {
                "is_valid": False,
                "errors": ["AI client not available"],
            }

        try:
            prompt = f"""
Validate this real estate data for completeness and accuracy:

{json.dumps(data, indent=2)}

Check:
1. Required fields present (title, price, location)
2. Data types correct (price is number, etc)
3. Values realistic (price > 0, sqm > 0, etc)
4. No obvious errors or inconsistencies

Return JSON:
{{
    "is_valid": true/false,
    "errors": ["error1", "error2"],
    "warnings": ["warning1"],
    "confidence_score": 0.0-1.0,
    "suggestions": ["suggestion1"]
}}
"""

            if self.client_type == "datapizza":
                response = await self.agent.run(prompt)
                output = response.get("output", {})

                if isinstance(output, str):
                    try:
                        output = json.loads(output)
                    except:
                        output = {"is_valid": False, "errors": ["parse_error"]}

                return output

            elif self.client_type == "google":
                response = await asyncio.to_thread(
                    self.client.generate_content,
                    prompt
                )

                text = response.text

                # Parse JSON
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()

                return json.loads(text)

        except Exception as e:
            logger.error(f"Validation failed: {e}")
            return {
                "is_valid": False,
                "errors": [str(e)],
            }


# Utility function
async def extract_property_from_html(
    html: str,
    url: str,
    api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Utility function to extract property data from HTML

    Args:
        html: HTML content
        url: Source URL
        api_key: Google API key

    Returns:
        Extracted property data
    """
    extractor = SemanticExtractor(api_key=api_key)
    return await extractor.extract_property_data(html, url)


# Import asyncio for google client
import asyncio

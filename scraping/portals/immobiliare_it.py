"""
Immobiliare.it Scraper
React SPA with advanced anti-bot protection
"""

import asyncio
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
from bs4 import BeautifulSoup
import logging

from .base_scraper import BaseScraper


logger = logging.getLogger(__name__)


class ImmobiliareItScraper(BaseScraper):
    """
    Scraper for Immobiliare.it
    Handles React SPA, anti-detection, and session persistence
    """

    portal_name = "immobiliare_it"
    base_url = "https://www.immobiliare.it"
    rate_limit = 0.5  # 2 requests per second max (be conservative)

    async def wait_for_content(self, page):
        """Wait for React content to render"""
        try:
            # Wait for listing cards to appear
            await page.wait_for_selector(
                "[class*='nd-list__item'], [class*='in-card']",
                timeout=15000,
                state="visible"
            )
            # Additional wait for JS to finish
            await asyncio.sleep(2)
            logger.debug("Content loaded successfully")
        except Exception as e:
            logger.warning(f"Content wait timeout (may be OK): {e}")
            # Continue anyway, some pages may load differently

    async def scrape_search(
        self,
        location: str,
        contract_type: str = "vendita",  # vendita, affitto
        property_type: Optional[str] = None,  # appartamento, casa, villa, etc
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        rooms_min: Optional[int] = None,
        sqm_min: Optional[float] = None,
        max_pages: int = 3,
    ) -> List[Dict]:
        """
        Scrape search results from Immobiliare.it

        Args:
            location: City name (e.g., "roma", "milano")
            contract_type: "vendita" or "affitto"
            property_type: Property type filter
            price_min: Minimum price
            price_max: Maximum price
            rooms_min: Minimum rooms
            sqm_min: Minimum square meters
            max_pages: Max pages to scrape

        Returns:
            List of listing dictionaries
        """
        all_listings = []

        for page_num in range(1, max_pages + 1):
            try:
                # Build URL
                url = self._build_search_url(
                    location=location,
                    contract_type=contract_type,
                    property_type=property_type,
                    price_min=price_min,
                    price_max=price_max,
                    rooms_min=rooms_min,
                    sqm_min=sqm_min,
                    page=page_num,
                )

                logger.info(f"Scraping page {page_num}/{max_pages}: {url}")

                # Fetch page with session (for authenticated features)
                html = await self.fetch_page_with_session(url)

                # Parse listings
                listings = self._parse_search_page(html, url)

                logger.info(f"Found {len(listings)} listings on page {page_num}")

                all_listings.extend(listings)

                # Check if last page (no listings found)
                if len(listings) == 0:
                    logger.info("No more listings found, stopping")
                    break

                # Delay between pages
                await asyncio.sleep(2)

            except Exception as e:
                logger.error(f"Error scraping page {page_num}: {e}")
                continue

        logger.info(f"Total listings scraped: {len(all_listings)}")
        return all_listings

    def _build_search_url(
        self,
        location: str,
        contract_type: str,
        property_type: Optional[str],
        price_min: Optional[float],
        price_max: Optional[float],
        rooms_min: Optional[int],
        sqm_min: Optional[float],
        page: int,
    ) -> str:
        """Build search URL with filters"""

        # Normalize location
        location = location.lower().replace(" ", "-")

        # Base path
        path = f"/{contract_type}-case/{location}/"

        # Query params
        params = []

        if property_type:
            params.append(f"tipoImmobile={property_type}")

        if price_min:
            params.append(f"prezzoMinimo={int(price_min)}")

        if price_max:
            params.append(f"prezzoMassimo={int(price_max)}")

        if rooms_min:
            params.append(f"localiMinimo={rooms_min}")

        if sqm_min:
            params.append(f"superficieMinima={int(sqm_min)}")

        if page > 1:
            params.append(f"pag={page}")

        query = "?" + "&".join(params) if params else ""

        return self.base_url + path + query

    def _parse_search_page(self, html: str, url: str) -> List[Dict]:
        """Parse search results page"""
        soup = self.parse_html(html)
        listings = []

        # Find all listing cards (multiple possible class patterns)
        card_selectors = [
            "div[class*='nd-list__item']",
            "div[class*='in-card']",
            "div[data-testid='ad-item']",
            "article[class*='realEstate']",
        ]

        cards = []
        for selector in card_selectors:
            found = soup.select(selector)
            if found:
                cards = found
                logger.debug(f"Found {len(cards)} cards with selector: {selector}")
                break

        if not cards:
            logger.warning("No listing cards found on page")
            return []

        for idx, card in enumerate(cards):
            try:
                listing = self._parse_listing_card(card)
                if listing:
                    listing["source_url_search"] = url
                    listing["card_index"] = idx
                    listings.append(listing)
            except Exception as e:
                logger.error(f"Error parsing card {idx}: {e}")
                continue

        return listings

    def _parse_listing_card(self, card) -> Optional[Dict]:
        """Parse single listing card from search results"""
        try:
            # Link
            link_elem = card.find("a", href=True)
            if not link_elem:
                return None

            listing_url = link_elem.get("href")
            if listing_url and not listing_url.startswith("http"):
                listing_url = self.base_url + listing_url

            # Title
            title_selectors = [
                "a[class*='title']",
                "h2",
                "div[class*='titolo']",
                "[class*='nd-title']",
            ]
            title = None
            for selector in title_selectors:
                title_elem = card.select_one(selector)
                if title_elem:
                    title = title_elem.text.strip()
                    break

            # Price
            price_selectors = [
                "li[class*='price']",
                "div[class*='prezzo']",
                "span[class*='price']",
                "[class*='nd-list__item'][class*='price']",
            ]
            price_text = None
            for selector in price_selectors:
                price_elem = card.select_one(selector)
                if price_elem:
                    price_text = price_elem.text.strip()
                    break

            price = self._parse_price(price_text) if price_text else None

            # Location
            location_selectors = [
                "div[class*='location']",
                "span[class*='localita']",
                "[class*='nd-list__item'][class*='location']",
            ]
            location = None
            for selector in location_selectors:
                location_elem = card.select_one(selector)
                if location_elem:
                    location = location_elem.text.strip()
                    break

            # Features (sqm, rooms, bathrooms)
            features = self._parse_features(card)

            # Image
            img_elem = card.find("img")
            image_url = None
            if img_elem:
                image_url = img_elem.get("src") or img_elem.get("data-src")

            # Extract ID from URL if possible
            listing_id = None
            if listing_url:
                id_match = re.search(r'/(\d+)\.html', listing_url)
                if id_match:
                    listing_id = id_match.group(1)

            return {
                "source": "immobiliare_it",
                "source_url": listing_url,
                "listing_id": listing_id,
                "title": title,
                "price": price,
                "price_text": price_text,
                "location": location,
                "sqm": features.get("sqm"),
                "rooms": features.get("rooms"),
                "bathrooms": features.get("bathrooms"),
                "image_url": image_url,
                "scraped_at": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error parsing card: {e}")
            return None

    def _parse_price(self, price_text: Optional[str]) -> Optional[float]:
        """Extract numeric price from text"""
        if not price_text:
            return None

        try:
            # Remove currency symbols, spaces, dots (thousands separator)
            clean_text = price_text.replace("€", "").replace(".", "").replace(" ", "").strip()

            # Extract numbers
            numbers = re.findall(r'\d+', clean_text)
            if numbers:
                # Join all numbers (handles cases like "250 000")
                price_str = "".join(numbers)
                return float(price_str)

        except Exception as e:
            logger.debug(f"Could not parse price '{price_text}': {e}")

        return None

    def _parse_features(self, card) -> Dict:
        """Parse property features from card"""
        features = {
            "sqm": None,
            "rooms": None,
            "bathrooms": None,
        }

        # Find feature list
        feature_list = card.select("ul li, div[class*='feature'], span[class*='caratteristiche']")

        for item in feature_list:
            text = item.text.strip().lower()

            # Square meters
            if any(marker in text for marker in ["m²", "mq", "metri"]):
                match = re.search(r'(\d+)', text)
                if match:
                    features["sqm"] = int(match.group(1))

            # Rooms/locali
            elif any(marker in text for marker in ["local", "vani", "stanze"]):
                match = re.search(r'(\d+)', text)
                if match:
                    features["rooms"] = int(match.group(1))

            # Bathrooms
            elif "bagn" in text:
                match = re.search(r'(\d+)', text)
                if match:
                    features["bathrooms"] = int(match.group(1))

        return features

    async def parse_listing(self, html: str, url: str) -> Dict:
        """
        Parse detailed listing page
        (For future enhancement - extract full property details)

        Args:
            html: HTML content
            url: Source URL

        Returns:
            Detailed listing dict
        """
        soup = self.parse_html(html)

        # TODO: Implement detailed page parsing
        # This would extract:
        # - Full description
        # - All images
        # - Energy class
        # - Detailed features
        # - Contact information
        # - Map coordinates

        return {
            "source_url": url,
            "scraped_at": datetime.utcnow().isoformat(),
            "status": "detailed_parsing_not_implemented",
        }

    async def scrape_listing_details(self, listing_url: str) -> Dict:
        """
        Scrape detailed listing page

        Args:
            listing_url: URL of listing detail page

        Returns:
            Detailed listing dict
        """
        try:
            html = await self.fetch_page_with_session(listing_url)
            return await self.parse_listing(html, listing_url)
        except Exception as e:
            logger.error(f"Error scraping listing details {listing_url}: {e}")
            return {"error": str(e), "url": listing_url}

    async def login(self, email: str, password: str):
        """
        Perform login and save session

        Args:
            email: Login email
            password: Login password
        """
        login_url = f"{self.base_url}/login"

        try:
            page = await self.browser.new_page()
            await page.goto(login_url, wait_until="networkidle")

            # Wait for login form
            await page.wait_for_selector("input[type='email'], input[name='email']", timeout=10000)

            # Fill login form (adjust selectors based on actual form)
            await page.fill("input[type='email'], input[name='email']", email)
            await page.fill("input[type='password'], input[name='password']", password)

            # Submit
            await page.click("button[type='submit'], input[type='submit']")

            # Wait for navigation
            await page.wait_for_url("**/dashboard*", timeout=15000)

            # Save session
            await self.browser.save_current_session(page, is_authenticated=True)

            logger.info("Login successful, session saved")

            await page.close()

        except Exception as e:
            logger.error(f"Login failed: {e}")
            raise


# Example usage
async def main():
    """Example usage of ImmobiliareItScraper"""
    async with ImmobiliareItScraper(profile_name="test_profile") as scraper:
        # Scrape search results
        listings = await scraper.scrape_search(
            location="roma",
            contract_type="vendita",
            price_max=500000,
            rooms_min=2,
            max_pages=2,
        )

        print(f"\n{'='*80}")
        print(f"Found {len(listings)} listings")
        print(f"{'='*80}\n")

        # Print first 3 listings
        for i, listing in enumerate(listings[:3], 1):
            print(f"\n--- Listing {i} ---")
            print(f"Title: {listing.get('title')}")
            print(f"Price: €{listing.get('price'):,.0f}" if listing.get('price') else "Price: N/A")
            print(f"Location: {listing.get('location')}")
            print(f"Size: {listing.get('sqm')} m²" if listing.get('sqm') else "Size: N/A")
            print(f"Rooms: {listing.get('rooms')}" if listing.get('rooms') else "Rooms: N/A")
            print(f"URL: {listing.get('source_url')}")


if __name__ == "__main__":
    # Run example
    asyncio.run(main())

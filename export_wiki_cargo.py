import argparse
import html
import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urlencode

import requests
from requests.exceptions import ConnectionError, SSLError


API_URL = "https://nmsgalactichub.miraheze.org/w/api.php"
USER_AGENT = "GalacticHubArchive_1.0"
BASE_CREATURE_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Region",
    "System",
    "Planet",
    "Moon",
    "Glyphs",
    "Coordinates",
    "Height",
    "Weight",
    "Genus",
    "WormClass",
    "WormDepth",
    "WormStomach",
    "Civilized=Civilization",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
    "Game_release=GameRelease",
    "Feature",
]
OPTIONAL_CREATURE_FIELDS = {
    "CombatEffectiveness": "CombatEffectiveness",
    "Agility": "Agility",
    "Health": "Health",
}
STARSHIP_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Game_release=GameRelease",
    "Type",
    "Acquisition",
    "Galaxy",
    "Civilized=Civilization",
    "Glyphs",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
]
BASE_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Builder",
    "Builderlink=BuilderLink",
    "Game_release=GameRelease",
    "Type",
    "Galaxy",
    "Civilized=Civilization",
    "Glyphs",
]
FLORA_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Glyphs",
    "Biome",
    "Type",
    "Civilized=Civilization",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
]
PLANET_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Glyphs",
    "Description",
    "Biome",
    "Weather",
    "SkyColor",
    "GrassColor",
    "Sentinel",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
    "Civilized=Civilization",
]
MOON_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Glyphs",
    "Description",
    "Type",
    "Weather",
    "SkyColor",
    "GrassColor",
    "Sentinel",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
    "Civilized=Civilization",
]
MINERAL_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Glyphs",
    "Civilized=Civilization",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
]
MULTITOOL_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Type",
    "Galaxy",
    "Glyphs",
    "Civilized=Civilization",
    "Slots",
    "MT_class=MTClass",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
]
SYSTEM_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Region",
    "Stars",
    "Planets",
    "Moons",
    "Color",
    "SpectralClass",
    "Glyphs",
    "Water",
    "Dissonant",
    "Faction",
    "Economy",
    "EconomySell",
    "EconomyBuy",
    "Wealth",
    "Conflict",
    "Civilized=Civilization",
    "Discovered=DiscoveredBy",
    "DiscoveredLink=DiscovererPage",
]
COLONY_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Galaxy",
    "Glyphs",
    "Restricted",
    "Status",
    "Civilized=Civilization",
]
BUSINESS_FIELDS = [
    "_pageName=Page",
    "Name",
    "Image",
    "Description",
    "Services",
    "Vanilla",
    "Owner",
    "Civilized=Civilization",
    "HidePage",
]
FILE_BATCH_SIZE = 50


class GalacticHubCargoExporter:
    def __init__(self, delay_seconds=0.25, batch_size=500):
        self.delay_seconds = delay_seconds
        self.batch_size = batch_size
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})
        self._available_creature_fields = None
        self._available_starship_fields = None
        self._available_base_fields = None
        self._available_flora_fields = None
        self._available_planet_fields = None
        self._available_moon_fields = None
        self._available_mineral_fields = None
        self._available_multitool_fields = None
        self._available_system_fields = None
        self._available_colony_fields = None
        self._available_business_fields = None

    def fetch_creatures(self):
        rows = []
        offset = 0
        creature_fields = self.get_creature_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Creatures",
                "fields": ",".join(creature_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)

            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def get_creature_fields(self):
        if self._available_creature_fields is not None:
            return self._available_creature_fields

        fields = list(BASE_CREATURE_FIELDS)
        schema = self.get_cargo_fields("Creatures")
        schema_keys = {key.casefold() for key in schema}

        for source_name, alias_name in OPTIONAL_CREATURE_FIELDS.items():
            if source_name.casefold() in schema_keys:
                fields.append(f"{source_name}={alias_name}")

        self._available_creature_fields = fields
        return fields

    def get_cargo_fields(self, table_name):
        payload = self.get_json({
            "action": "cargofields",
            "format": "json",
            "table": table_name,
        })
        return payload.get("cargofields", {})

    def fetch_starships(self):
        rows = []
        offset = 0
        starship_fields = self.get_starship_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Starships",
                "fields": ",".join(starship_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_bases(self):
        rows = []
        offset = 0
        base_fields = self.get_base_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Bases",
                "fields": ",".join(base_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_flora(self):
        rows = []
        offset = 0
        flora_fields = self.get_flora_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Flora",
                "fields": ",".join(flora_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_planets(self):
        rows = []
        offset = 0
        planet_fields = self.get_planet_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Planets",
                "fields": ",".join(planet_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_moons(self):
        rows = []
        offset = 0
        moon_fields = self.get_moon_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Moons",
                "fields": ",".join(moon_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_minerals(self):
        rows = []
        offset = 0
        mineral_fields = self.get_mineral_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Minerals",
                "fields": ",".join(mineral_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_multitools(self):
        rows = []
        offset = 0
        multitool_fields = self.get_multitool_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Multitools",
                "fields": ",".join(multitool_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_systems(self):
        rows = []
        offset = 0
        system_fields = self.get_system_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Systems",
                "fields": ",".join(system_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_colonies(self):
        rows = []
        offset = 0
        colony_fields = self.get_colony_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Colonies",
                "fields": ",".join(colony_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def fetch_businesses(self):
        rows = []
        offset = 0
        business_fields = self.get_business_fields()

        while True:
            params = {
                "action": "cargoquery",
                "format": "json",
                "tables": "Businesses",
                "fields": ",".join(business_fields),
                "limit": self.batch_size,
                "offset": offset,
            }

            payload = self.get_json(params)
            batch = payload.get("cargoquery", [])
            if not batch:
                break

            rows.extend(item["title"] for item in batch)
            offset += self.batch_size
            time.sleep(self.delay_seconds)

        return rows

    def get_starship_fields(self):
        if self._available_starship_fields is not None:
            return self._available_starship_fields

        schema = self.get_cargo_fields("Starships")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in STARSHIP_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_starship_fields = fields
        return fields

    def get_base_fields(self):
        if self._available_base_fields is not None:
            return self._available_base_fields

        schema = self.get_cargo_fields("Bases")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in BASE_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_base_fields = fields
        return fields

    def get_flora_fields(self):
        if self._available_flora_fields is not None:
            return self._available_flora_fields

        schema = self.get_cargo_fields("Flora")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in FLORA_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_flora_fields = fields
        return fields

    def get_planet_fields(self):
        if self._available_planet_fields is not None:
            return self._available_planet_fields

        schema = self.get_cargo_fields("Planets")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in PLANET_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_planet_fields = fields
        return fields

    def get_moon_fields(self):
        if self._available_moon_fields is not None:
            return self._available_moon_fields

        schema = self.get_cargo_fields("Moons")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in MOON_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_moon_fields = fields
        return fields

    def get_mineral_fields(self):
        if self._available_mineral_fields is not None:
            return self._available_mineral_fields

        schema = self.get_cargo_fields("Minerals")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in MINERAL_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_mineral_fields = fields
        return fields

    def get_multitool_fields(self):
        if self._available_multitool_fields is not None:
            return self._available_multitool_fields

        schema = self.get_cargo_fields("Multitools")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in MULTITOOL_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_multitool_fields = fields
        return fields

    def get_system_fields(self):
        if self._available_system_fields is not None:
            return self._available_system_fields

        schema = self.get_cargo_fields("Systems")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in SYSTEM_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_system_fields = fields
        return fields

    def get_colony_fields(self):
        if self._available_colony_fields is not None:
            return self._available_colony_fields

        schema = self.get_cargo_fields("Colonies")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in COLONY_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_colony_fields = fields
        return fields

    def get_business_fields(self):
        if self._available_business_fields is not None:
            return self._available_business_fields

        schema = self.get_cargo_fields("Businesses")
        schema_keys = {key.casefold() for key in schema}
        fields = []

        for field in BUSINESS_FIELDS:
            source_name = field.split("=", 1)[0]
            if source_name.startswith("_") or source_name.casefold() in schema_keys:
                fields.append(field)

        self._available_business_fields = fields
        return fields

    def resolve_image_urls(self, file_names):
        unique_names = sorted({name.strip() for name in file_names if name and name.strip()})
        image_urls = {}

        for start in range(0, len(unique_names), FILE_BATCH_SIZE):
            batch = unique_names[start:start + FILE_BATCH_SIZE]
            titles = "|".join(f"File:{name}" for name in batch)
            params = {
                "action": "query",
                "format": "json",
                "prop": "imageinfo",
                "iiprop": "url",
                "titles": titles,
            }

            payload = self.get_json(params)

            for page in payload.get("query", {}).get("pages", {}).values():
                title = page.get("title", "")
                if not title.startswith("File:"):
                    continue

                file_name = title[5:]
                info = page.get("imageinfo", [])
                image_urls[file_name] = info[0]["url"] if info else ""

            time.sleep(self.delay_seconds)

        return image_urls

    def get_json(self, params):
        try:
            response = self.session.get(API_URL, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except (SSLError, ConnectionError):
            return self.get_json_via_curl(params)

    def get_json_via_curl(self, params):
        query_url = f"{API_URL}?{urlencode(params)}"
        result = subprocess.run(
            ["curl", "-sS", "-L", "--max-time", "30", query_url],
            check=True,
            capture_output=True,
            text=True,
        )
        return json.loads(result.stdout)

    def normalize_creature(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "region": clean_value(row.get("Region")),
            "system": clean_value(row.get("System")),
            "planet": clean_value(row.get("Planet")),
            "moon": clean_value(row.get("Moon")),
            "glyphs": clean_value(row.get("Glyphs")),
            "coordinates": clean_value(row.get("Coordinates")),
            "height": clean_value(row.get("Height")),
            "weight": clean_value(row.get("Weight")),
            "genus": clean_value(row.get("Genus")),
            "worm_class": clean_value(row.get("WormClass")),
            "worm_depth": clean_value(row.get("WormDepth")),
            "worm_stomach": clean_value(row.get("WormStomach")),
            "civilization": clean_value(row.get("Civilization")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
            "game_release": clean_value(row.get("GameRelease")),
            "feature": clean_value(row.get("Feature")),
            "combat_effectiveness": clean_value(row.get("CombatEffectiveness")),
            "agility": clean_value(row.get("Agility")),
            "health": clean_value(row.get("Health")),
        }

    def normalize_starship(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "game_release": clean_value(row.get("GameRelease")),
            "type": clean_value(row.get("Type")),
            "acquisition": clean_value(row.get("Acquisition")),
            "galaxy": clean_value(row.get("Galaxy")),
            "civilization": clean_value(row.get("Civilization")),
            "glyphs": clean_value(row.get("Glyphs")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_base(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")
        builder_link = clean_value(row.get("BuilderLink"))

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "builder": clean_value(row.get("Builder")),
            "builder_link": builder_link,
            "builder_url": build_discoverer_url(builder_link),
            "game_release": clean_value(row.get("GameRelease")),
            "type": clean_value(row.get("Type")),
            "galaxy": clean_value(row.get("Galaxy")),
            "civilization": clean_value(row.get("Civilization")),
            "glyphs": clean_value(row.get("Glyphs")),
        }

    def normalize_flora(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "glyphs": clean_value(row.get("Glyphs")),
            "biome": clean_value(row.get("Biome")),
            "type": clean_value(row.get("Type")),
            "civilization": clean_value(row.get("Civilization")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_planet(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "body_type": "Planet",
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "glyphs": clean_value(row.get("Glyphs")),
            "description": clean_value(row.get("Description")),
            "biome": clean_value(row.get("Biome")),
            "weather": clean_value(row.get("Weather")),
            "sky_color": clean_value(row.get("SkyColor")),
            "grass_color": clean_value(row.get("GrassColor")),
            "sentinel": clean_value(row.get("Sentinel")),
            "civilization": clean_value(row.get("Civilization")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_moon(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "body_type": "Moon",
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "glyphs": clean_value(row.get("Glyphs")),
            "description": clean_value(row.get("Description")),
            "biome": clean_value(row.get("Type")),
            "weather": clean_value(row.get("Weather")),
            "sky_color": clean_value(row.get("SkyColor")),
            "grass_color": clean_value(row.get("GrassColor")),
            "sentinel": clean_value(row.get("Sentinel")),
            "civilization": clean_value(row.get("Civilization")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_mineral(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "glyphs": clean_value(row.get("Glyphs")),
            "civilization": clean_value(row.get("Civilization")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_multitool(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "type": clean_value(row.get("Type")),
            "galaxy": clean_value(row.get("Galaxy")),
            "glyphs": clean_value(row.get("Glyphs")),
            "civilization": clean_value(row.get("Civilization")),
            "slots": clean_value(row.get("Slots")),
            "mt_class": clean_value(row.get("MTClass")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_system(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "region": clean_value(row.get("Region")),
            "stars": clean_value(row.get("Stars")),
            "planets": clean_value(row.get("Planets")),
            "moons": clean_value(row.get("Moons")),
            "color": clean_value(row.get("Color")),
            "spectral_class": clean_value(row.get("SpectralClass")),
            "glyphs": clean_value(row.get("Glyphs")),
            "water": clean_value(row.get("Water")),
            "dissonant": clean_value(row.get("Dissonant")),
            "faction": clean_value(row.get("Faction")),
            "economy": clean_value(row.get("Economy")),
            "economy_sell": clean_value(row.get("EconomySell")),
            "economy_buy": clean_value(row.get("EconomyBuy")),
            "wealth": clean_value(row.get("Wealth")),
            "conflict": clean_value(row.get("Conflict")),
            "civilization": clean_value(row.get("Civilization")),
            "discovered_by": clean_value(row.get("DiscoveredBy")),
            "discoverer_page": clean_value(row.get("DiscovererPage")),
            "discoverer_url": build_discoverer_url(clean_value(row.get("DiscovererPage"))),
        }

    def normalize_colony(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "galaxy": clean_value(row.get("Galaxy")),
            "glyphs": clean_value(row.get("Glyphs")),
            "restricted": clean_value(row.get("Restricted")),
            "status": clean_value(row.get("Status")),
            "civilization": clean_value(row.get("Civilization")),
        }

    def normalize_business(self, row, image_urls):
        image_name = clean_value(row.get("Image"))
        page_title = clean_value(row.get("Page")) or clean_value(row.get("Name"))
        page_slug = page_title.replace(" ", "_")

        return {
            "page": page_title,
            "page_url": f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_slug, safe=':_()/')}",
            "name": clean_value(row.get("Name")),
            "image_name": image_name,
            "image_url": image_urls.get(image_name, "") or build_file_url(image_name),
            "description": clean_value(row.get("Description")),
            "services": clean_value(row.get("Services")),
            "vanilla": clean_value(row.get("Vanilla")),
            "owner": clean_value(row.get("Owner")),
            "civilization": clean_value(row.get("Civilization")),
            "hide_page": clean_value(row.get("HidePage")),
        }

    def export_creatures(self, output_path):
        rows = self.fetch_creatures()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_creature(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Creatures",
                "count": len(items),
                "available_fields": self.get_creature_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_starships(self, output_path):
        rows = self.fetch_starships()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_starship(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Starships",
                "count": len(items),
                "available_fields": self.get_starship_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_bases(self, output_path):
        rows = self.fetch_bases()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_base(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Bases",
                "count": len(items),
                "available_fields": self.get_base_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_flora(self, output_path):
        rows = self.fetch_flora()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_flora(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Flora",
                "count": len(items),
                "available_fields": self.get_flora_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_planets(self, output_path):
        planet_rows = self.fetch_planets()
        moon_rows = self.fetch_moons()
        rows = planet_rows + moon_rows
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_planet(row, image_urls) for row in planet_rows]
        items.extend(self.normalize_moon(row, image_urls) for row in moon_rows)
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Planets",
                "count": len(items),
                "available_fields": {
                    "planets": self.get_planet_fields(),
                    "moons": self.get_moon_fields(),
                },
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_minerals(self, output_path):
        rows = self.fetch_minerals()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_mineral(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Minerals",
                "count": len(items),
                "available_fields": self.get_mineral_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_multitools(self, output_path):
        rows = self.fetch_multitools()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_multitool(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Multitools",
                "count": len(items),
                "available_fields": self.get_multitool_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_systems(self, output_path):
        rows = self.fetch_systems()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_system(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Systems",
                "count": len(items),
                "available_fields": self.get_system_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_colonies(self, output_path):
        rows = self.fetch_colonies()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_colony(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Colonies",
                "count": len(items),
                "available_fields": self.get_colony_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload

    def export_businesses(self, output_path):
        rows = self.fetch_businesses()
        image_urls = self.resolve_image_urls(row.get("Image", "") for row in rows)
        items = [self.normalize_business(row, image_urls) for row in rows]
        items = remove_empty_rows(items)
        items.sort(key=lambda item: item["name"].lower())

        payload = {
            "meta": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "source": API_URL,
                "table": "Businesses",
                "count": len(items),
                "available_fields": self.get_business_fields(),
            },
            "items": items,
        }

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")
        return payload


def clean_value(value):
    if value is None:
        return ""
    return html.unescape(str(value).strip())


def build_discoverer_url(page_title):
    if not page_title:
        return ""
    return f"https://nmsgalactichub.miraheze.org/wiki/{quote(page_title.replace(' ', '_'), safe=':_()/')}"


def build_file_url(file_name):
    if not file_name:
        return ""
    return f"https://nmsgalactichub.miraheze.org/wiki/Special:FilePath/{quote(file_name, safe='')}"


def remove_empty_rows(items):
    cleaned = []

    for item in items:
        non_empty_fields = sum(1 for value in item.values() if value not in ("", None))
        if is_template_record(item):
            continue
        if is_hidden_record(item):
            continue
        if item["name"] and non_empty_fields > 2:
            cleaned.append(item)

    return cleaned


def is_template_record(item):
    page = (item.get("page") or "").strip()
    name = (item.get("name") or "").strip()
    ignored_prefixes = ("Template:", "User:")
    return page.startswith(ignored_prefixes) or name.startswith(ignored_prefixes)


def is_hidden_record(item):
    hide_page = (item.get("hide_page") or "").strip().lower()
    return hide_page in {"y", "yes", "true", "1"}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Export Galactic Hub Miraheze cargo data for the static wiki site."
    )
    parser.add_argument(
        "--output",
        default="data/creatures.json",
        help="Path to the generated JSON file.",
    )
    parser.add_argument(
        "--table",
        choices=["creatures", "starships", "bases", "flora", "planets", "minerals", "multitools", "systems", "colonies", "businesses"],
        default="creatures",
        help="Cargo table to export.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.25,
        help="Delay between API requests in seconds.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=500,
        help="Cargo query batch size.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    exporter = GalacticHubCargoExporter(
        delay_seconds=max(args.delay, 0.0),
        batch_size=max(1, min(args.batch_size, 500)),
    )
    output_path = Path(args.output)
    if args.table == "starships":
        payload = exporter.export_starships(output_path)
    elif args.table == "bases":
        payload = exporter.export_bases(output_path)
    elif args.table == "flora":
        payload = exporter.export_flora(output_path)
    elif args.table == "planets":
        payload = exporter.export_planets(output_path)
    elif args.table == "minerals":
        payload = exporter.export_minerals(output_path)
    elif args.table == "multitools":
        payload = exporter.export_multitools(output_path)
    elif args.table == "systems":
        payload = exporter.export_systems(output_path)
    elif args.table == "colonies":
        payload = exporter.export_colonies(output_path)
    elif args.table == "businesses":
        payload = exporter.export_businesses(output_path)
    else:
        payload = exporter.export_creatures(output_path)
    print(
        f"Wrote {payload['meta']['count']} {args.table} records to "
        f"{output_path} at {payload['meta']['generated_at']}"
    )


if __name__ == "__main__":
    main()

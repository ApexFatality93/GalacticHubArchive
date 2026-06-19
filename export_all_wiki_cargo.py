from pathlib import Path

from export_wiki_cargo import GalacticHubCargoExporter


TABLE_EXPORTS = (
    ("creatures", "data/creatures.json"),
    ("starships", "data/starships.json"),
    ("bases", "data/bases.json"),
    ("flora", "data/flora.json"),
    ("planets", "data/planets.json"),
    ("minerals", "data/minerals.json"),
    ("multitools", "data/multitools.json"),
    ("systems", "data/systems.json"),
    ("colonies", "data/colonies.json"),
    ("businesses", "data/businesses.json"),
)


def main():
    exporter = GalacticHubCargoExporter()

    for table_name, output_path in TABLE_EXPORTS:
        export_method = getattr(exporter, f"export_{table_name}")
        payload = export_method(Path(output_path))
        print(
            f"Wrote {payload['meta']['count']} {table_name} records to "
            f"{output_path} at {payload['meta']['generated_at']}"
        )


if __name__ == "__main__":
    main()

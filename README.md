# Galactic Hub Archives

Static archive site for browsing Galactic Hub wiki cargo data with HTML, CSS, JS, and exported JSON files.

## What This Repo Does

- Exports data from the Galactic Hub Miraheze wiki Cargo tables into JSON files under `data/`
- Serves those JSON files through category pages such as creatures, starships, planets, systems, and businesses
- Uses shared client-side logic in `script.js` for filters, sorting, pagination, URL params, footer rendering, and freshness labels
- Regenerates archive data automatically once per day with GitHub Actions

## GitHub Actions

Main file:

- `.github/workflows/daily-wiki-export.yml`

What it does:

- runs once per day on a cron schedule
- can also be started manually with `workflow_dispatch`
- installs Python dependencies from `requirements.txt`
- runs `python export_all_wiki_cargo.py`
- commits updated `data/*.json` files if they changed

Note:

- If the export job fails, the commit step does not run, so the repo keeps the last successful JSON exports.
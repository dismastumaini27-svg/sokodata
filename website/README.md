# SokoData Tanzania

Open, sourced prices of Tanzanian food crops and livestock, in Kiswahili and English.

Live site: https://dismastumaini27-svg.github.io/sokodata/

## What is in this folder

| Path | What it is |
| --- | --- |
| `index.html` | The page structure (sections and tabs) |
| `assets/style.css` | Colours, fonts and layout (light and dark mode) |
| `assets/map.js` | The price map: colours each region by price, hover card, region panel |
| `data/tz_regions.json` | Simplified region shapes (Tanzania NBS via geoBoundaries, CC BY 4.0) |
| `assets/app.js` | Loads the data and draws the charts and tables; all text in both languages is in the `T` block at the top |
| `data/*.json` | The data the site shows, built from the master CSV files |
| `scripts/build_data.py` | Turns `../data/*.csv` (filled by the daily Claude agent) into `data/*.json` |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

The site is plain HTML, CSS and JavaScript with no build tools, so any student can open and change it.

## Update the data

1. The daily agent fills `SokoData/data/*.csv` and rebuilds `website/data/*.json`.
2. To rebuild by hand: open a terminal in this `website` folder and run `python scripts/build_data.py`.
3. Upload the changed `data/*.json` files to GitHub (see below). The live site updates within a minute or two.

## See it on your computer

In a terminal in this folder run `python -m http.server 8000`, then open http://localhost:8000 in a browser.
(Opening `index.html` by double-click will not load the data; browsers block that.)

## Publish on GitHub Pages (first time)

1. Create a free account at https://github.com and sign in.
2. Click **New repository**, name it `sokodata`, choose **Public**, and create it.
3. Click **uploading an existing file**, then drag in everything inside this `website` folder (including the `assets`, `data` and `scripts` folders and the `.nojekyll` file), and click **Commit changes**.
4. Go to **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
5. After a minute the site is live at `https://dismastumaini27-svg.github.io/sokodata/`.

Later, GitHub Desktop (https://desktop.github.com) makes updating easier: it syncs this folder with one click.

## Ideas for future development

- Price trend charts per region (ready: the History tab fills in as weeks are collected)
- A map of regional prices
- Downloads (CSV) and a simple API for paying users
- WhatsApp/SMS weekly summary
- Profit-after-transport calculator between regions
- Own daily price collection from markets and abattoirs

## Data and licence

Prices are taken from reports of the Ministry of Agriculture (Wizara ya Kilimo) and the Ministry of Livestock and Fisheries (Wizara ya Mifugo na Uvuvi), with a link to each original report. They are republished with attribution and are not official statistics. Newspaper figures are kept separately as a secondary source.

Code: MIT licence (see `LICENSE`).

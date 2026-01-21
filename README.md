# airbnb-listings-dom
# Airbnb Listings – JavaScript & DOM Practice

This project was built as a practice assignment for working with JavaScript, the DOM, and loading data using `fetch()` and `async/await`.

The page loads Airbnb listing data from a JSON file and displays the first 50 listings in a card-based layout.

## Live Site (GitHub Pages)
https://zihanguo1204.github.io/airbnb-listings-dom/

GitHub Pages (Live site): https://zihanguo1204.github.io/airbnb-listings-dom/

## What the Page Does
- Loads listing data from a local JSON file using `fetch`
- Displays the first 50 Airbnb listings
- Each listing shows:
  - Name
  - Price
  - Host name and host photo
  - Thumbnail image
  - Description (expand / collapse)
  - Amenities

## Extra / Creative Features
To go beyond the basic requirements, I added:
- A favorites feature (❤️) using LocalStorage
- Search by listing name or description
- Option to filter and show only favorite listings
- Clickable listing images that open a larger preview in a modal
- Image fallback handling for broken or missing images

## Data Source
The listing data comes from:
- `airbnb_sf_listings_500.json`

## Running the Project Locally
Because this project uses `fetch()` to load JSON data, it needs to be run with a local server (not by opening the file directly).

### Option 1: VS Code Live Server
- Right-click `index.html`
- Select **Open with Live Server**

### Option 2: Python Simple Server
```bash
python3 -m http.server 5500

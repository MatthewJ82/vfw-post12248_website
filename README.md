# VFW Post 12248 website

Static site hosted on Cloudflare Pages. Commit to `main` and it deploys automatically.

## Files
- `index.html`, `about.html`, `events.html`, `join.html`, `donate.html`, `contact.html` - the pages
- `styles.css` - all styling (colors are at the top of the file)
- `site.js` - mobile menu + loads events
- `news.json` - **edit this to post news.** One entry per item with an `id`, `date` (YYYY-MM-DD), `title`, `summary`, and optional `full` story and `image`. Each item gets its own page at `news.html?story=ID`. Newest shows first.
- `events.json` - **edit this to add events.** One entry per event, date as YYYY-MM-DD. Past events hide automatically.
- `images/` - put the emblem and photos here

## Adding an event
Open `events.json` on GitHub, click the pencil, add an entry like:

    { "date": "2026-11-11", "title": "Veterans Day Ceremony", "time": "11:00 AM", "location": "Post Hall", "description": "Open to the public." }

Commit. The site updates itself within a minute.

## Things still marked "Placeholder"
Search the HTML files for `placeholder` to find every spot waiting on content from the commander.

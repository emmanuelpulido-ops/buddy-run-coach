BUDDY RUN COACH

What it does
- Shows the full 29-week Irving Half Marathon plan
- Calculates the current training week and race countdown
- Lets you manually log distance, duration (hours/minutes/seconds), heart rate, RPE, and notes
- Automatically calculates pace
- Tracks weekly mileage, total mileage, completion %, longest run, average pace, average HR, and total time
- Shows a weekly mileage chart and personal bests
- Saves data locally on the device/browser
- Supports JSON backup export/import
- Works offline after first load when served as a PWA

IMPORTANT
Your run data is stored in your browser's local storage. If you clear Safari/Chrome website data, your entries can be erased. Use Export backup from time to time.

HOW TO USE ON IPHONE
This is a Progressive Web App (PWA). For full install/offline behavior it needs to be hosted on a simple HTTPS web host.
1. Upload this folder to a static host such as GitHub Pages, Netlify, Cloudflare Pages, or Vercel.
2. Open the hosted URL in Safari on your iPhone.
3. Tap Share > Add to Home Screen.
4. Launch Buddy Run Coach from your Home Screen.

For a quick desktop preview, run a local web server from this folder, for example:
python -m http.server 8000
Then open http://localhost:8000


UPDATE v2
- Duration entry now uses separate Hours, Minutes, and Seconds number fields for easier iPhone entry.

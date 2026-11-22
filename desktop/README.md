# openGym for Linux

The phone app (the `VITE_MOBILE=1` build) in an Electron window, packaged as an AppImage and a
`.deb`. Everything the phone app does in its WebView works the same here, including the
first-launch choice between **Use on this device** and **Connect to my server**. Connecting pairs
with your server exactly like a phone does (docs/MOBILE.md): in a signed-in browser open
Settings → Account → "Pair the mobile app" and type the code into the desktop app. From then on
it syncs with the server and keeps working offline.

In a window 1400 px or wider, `wide.css` spreads the pages out (Home in two columns, Stats cards
two to a row). It lives here rather than in the frontend so merges from upstream never conflict.

The page is served as `https://localhost`, the same origin the Android app has, so the server's
CORS answers need no changes.

Things that need phone hardware or a phone OS are not here: watches, home-screen widgets,
Health Connect / HealthKit, NFC and the Live Activity.

## Build

Node 22, as for the rest of the repository (`cd frontend && npm ci` first).

```bash
cd desktop
npm install
npm run app      # phone build + 180 px exercise media into desktop/app
npm start        # run it
npm run dist     # dist/openGym-<version>.AppImage and dist/opengym-desktop_<version>_amd64.deb
```

Only the 180 px media go in (scripts/catalogue/stage-media.mjs without `APP_MEDIA_DIR`), the same
files the web image serves.

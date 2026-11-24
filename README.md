# Starbreaker

An Asteroids-style space shooter. Everything it needs is in `index.html`: the game code, styles and icons. No build step is needed.

## Run it locally
Open `index.html` in any modern browser.

Saving coins and progress uses localStorage. A few browsers block it for `file://` pages. If progress doesn't save, run a tiny local server:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Host it
Upload `index.html` (and the `icons/` folder if you want separate icon files) to any static host:
- **GitHub Pages:** push to a repo, then go to Settings → Pages → deploy from branch.
- **Netlify / Vercel / Cloudflare Pages:** drag and drop the folder, or connect the repo. There's no build command.
- Any web server or S3 bucket works too.

## Files
- `index.html`: the whole game. The favicon and home-screen icon are embedded in it.
- `icons/logo.svg`: the source logo, which you can scale to any size.
- `icons/icon-180.png`: an Apple touch icon / home-screen icon.
- `icons/icon-32.png`: a favicon PNG.
- `src/`: the same game split into the parts it was written in. Rebuild with:
  `cat src/1_head.html src/2_core.js src/3_game.js src/4_loop.js src/5_render.js src/5b_cutscene.js src/5c_designer.js src/5d_boss.js src/5e_bg.js src/6_input.js > index.html`

## Notes
- Fonts (Orbitron, Rajdhani) load from Google Fonts. Offline, the game falls back to system fonts.
- Progress is stored in the browser under the keys `sb_coins`, `sb_best`, `sb_mute` and `sb_autozap`. The in-game "Reset all progress" clears them.
- Controls:
  - **Touch:** drag anywhere to steer and thrust. Use FIRE or AUTO for shooting, and ⚡ or AUTO ⚡ for lightning.
  - **Keyboard:** arrows or WASD to fly, Space to fire, E for lightning, Z to toggle auto-lightning, P to pause.

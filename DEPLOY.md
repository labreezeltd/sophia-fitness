# Deploying to Render (and testing on your iPhone)

This app is a single Node web service — the Express server serves both the API
and the built React frontend. Deploying it gives you an HTTPS URL you can open
in Safari on your iPhone, with the mic/voice feature working (Safari only allows
the microphone over HTTPS).

## One-time setup

1. Go to **https://render.com** and sign in (you can use GitHub).
2. **New → Blueprint**, and select this repository
   (`labreezeltd/sophia-fitness`). Render reads `render.yaml` automatically.
3. When prompted, enter your **`ANTHROPIC_API_KEY`** (from
   https://console.anthropic.com/ → API Keys). This is the only value you need
   to provide — it is not stored in the repo.
4. Click **Apply**. Render runs `npm install && npm run build`, then
   `npm start`. First build takes a few minutes.
5. When it goes live you'll get a URL like `https://sophia-fitness.onrender.com`.
   Open it in Safari on your iPhone — the dashboard is fully mobile-responsive,
   and Central Command is at the **Command** tab (or `/#/command`).

## Notes

- **Free tier sleeps** after ~15 minutes of inactivity, so the first request
  after a nap takes ~30s to wake. Upgrade the service to keep it always-on.
- **Voice:** tap the mic in the command bar. It uses Safari's Web Speech API,
  which needs HTTPS — that's why it works on the deployed URL but not over a
  plain-HTTP local network address.
- **Data storage:** workout data is kept in a local SQLite file (`data.db`).
  On the free tier the filesystem is ephemeral, so that data resets on each
  deploy/restart. To persist it, attach a Render **Disk** (paid) mounted at the
  app directory. The Central Command feature itself is stateless and unaffected.
- **Without the key:** the app still runs and the dashboard animates, but the
  agents will show a "set ANTHROPIC_API_KEY" message instead of real output.

## Running locally instead

```bash
npm install
cp .env.example .env      # then put your real ANTHROPIC_API_KEY in .env
npm run dev               # http://localhost:5000
```

To reach it from your iPhone on the same Wi-Fi, open
`http://<your-computer-ip>:5000` in Safari (voice won't work over plain HTTP —
use the Render deploy for that).

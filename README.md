# MeetMind

MeetMind turns meeting transcripts into a saved summary, decisions, action items, and follow-up automation.

## Demo workflow

1. Start the API and React app in two terminals (commands below).
2. In the app, choose **Load demo transcript** or paste/upload a `.txt` or `.md` transcript.
3. Choose **Analyze Meeting**. Gemini returns structured results; the API saves the transcript and analysis in SQLite.
4. Open a saved meeting in **Saved Meetings** to review it later.
5. Enter a recipient and choose **Send recap** to send the summary, decisions, and action list by email.
6. Pick the follow-up start and end time and choose **Schedule** to create a Google Calendar event.

The page shows whether Gemini, Gmail, and Calendar credentials are configured. Gmail and Calendar use the Google account authorization; without those credentials, their endpoints return a setup message rather than pretending an action succeeded.

## Run locally

Requires Node.js 22.13 or newer (`node:sqlite` is built into Node).

```sh
cd server
npm install
cp .env.example .env
```

Add a Gemini API key to `server/.env` (`GEMINI_API_KEY`). Then start the backend:

```sh
npm run dev
```

In another terminal:

```sh
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to `http://localhost:5001`.

## Provider setup

### Gemini

Set `GEMINI_API_KEY` in `server/.env`. The key remains on the backend and is never sent to the browser. Meeting analysis uses Gemini 3.5 Flash-Lite through Google's Interactions API with a JSON schema for predictable output. The request uses minimal thinking and does not store interactions remotely.

### Gmail recap and Google Calendar

1. In Google Cloud Console, create/select a project, enable **Gmail API** and **Google Calendar API**, configure the OAuth consent screen, and add your Google account as a test user if the app is in testing.
2. Create an OAuth client ID (Web application) and add `https://developers.google.com/oauthplayground` as an authorized redirect URI.
3. Open [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground), open its settings, enable **Use your own OAuth credentials**, and enter that client ID and secret.
4. Authorize both `https://www.googleapis.com/auth/gmail.send` and `https://www.googleapis.com/auth/calendar.events`, exchange the authorization code, and copy the refresh token from the token response.
5. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` in `server/.env`; use `GOOGLE_CALENDAR_ID=primary` for the account's primary calendar. Set `APP_TIME_ZONE` to the calendar's IANA timezone (default `Asia/Kolkata`).

Keep `.env` private. The backend refreshes the access token on the server; Gmail recap is sent with Gmail's `users.messages.send` method and follow-up events are created with Google Calendar's events API.

## Backend routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health response |
| `GET` | `/api/integrations` | Reports which provider credentials are configured |
| `POST` | `/api/analyze` | Validate transcript, call Gemini, save analysis |
| `GET` | `/api/meetings` | List saved analyses |
| `GET` | `/api/meetings/:id` | Load one saved meeting, including transcript |
| `DELETE` | `/api/meetings/:id` | Delete a saved meeting |
| `POST` | `/api/meetings/:id/email` | Send a recap via Gmail (`{ "to": "name@example.com" }`) |
| `POST` | `/api/meetings/:id/calendar` | Create a follow-up event (`{ "start": "2026-12-01T10:00", "end": "2026-12-01T10:30" }`) |

## Data

SQLite creates `server/data/meetmind.sqlite` automatically on first run. The database stores the original transcript, analysis output, and creation time. `server/data/` and `.env` are ignored by Git. To back up the demo data, stop the API and copy the SQLite file.

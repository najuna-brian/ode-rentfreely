# ode-rentfreely

Private platform fork powering [RentFreely](https://github.com/najuna-brian/rentfreely) — a property rental app for Uganda.

This repo contains the native mobile shell, sync server, and CLI tools. The custom React app lives in the [rentfreely](https://github.com/najuna-brian/rentfreely) repo.

## Components

| Component | Path | Language | Description |
|---|---|---|---|
| **Formulus** | `formulus/` | React Native (TypeScript) | Android/iOS app that hosts the RentFreely WebView |
| **Synkronus** | `synkronus/` | Go | Sync server — data, auth, app bundles |
| **synk CLI** | `synkronus-cli/` | Go | CLI for uploading bundles, managing users, exporting data |
| **Synkronus Portal** | `synkronus-portal/` | React (TypeScript) | Web admin dashboard for Synkronus |
| **Formulus FormPlayer** | `formulus-formplayer/` | React (TypeScript) | JSON form renderer used inside the WebView |
| **Packages** | `packages/` | TypeScript | Shared libraries (form engine, API client, etc.) |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User's Phone                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  Formulus (React Native)                      │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  RentFreely (WebView)                   │  │  │
│  │  │  React + Vite + MUI                     │  │  │
│  │  │  ← formulusApi bridge →                 │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  WatermelonDB (local)  ←→  SyncService        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/S
          ┌───────────┴───────────┐
          │  Synkronus Server     │
          │  (Go + PostgreSQL)    │
          │  ┌─────────────────┐  │
          │  │ Auth  │ Sync    │  │
          │  │ Bundles │ Users │  │
          │  └─────────────────┘  │
          └───────────────────────┘
```

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥ 18 | Formulus build |
| [Java JDK](https://adoptium.net/) | 17 | Android builds |
| [Android SDK](https://developer.android.com/studio) | API 34 | Android builds |
| [Go](https://go.dev/) | ≥ 1.22 | Synkronus server & CLI builds |
| [Docker](https://www.docker.com/) | ≥ 24 | Running the server stack |
| [ADB](https://developer.android.com/tools/adb) | — | Deploying APKs to devices |

> **Workspace layout** — This repo should sit alongside the RentFreely app repo:
> ```
> ode-workspaces/
> ├── ode/           ← this repo
> └── RentFreely/    ← github.com/najuna-brian/rentfreely
> ```

## Getting Started

### 1. Clone both repos

```bash
mkdir ode-workspaces && cd ode-workspaces
git clone git@github.com:najuna-brian/ode-rentfreely.git ode
git clone git@github.com:najuna-brian/rentfreely.git RentFreely
```

### 2. Start the Synkronus server

```bash
cd ode/synkronus
docker compose up --build -d
```

This starts:
- **Synkronus API** on port `8080` (also proxied via nginx on port `80`)
- **PostgreSQL** database
- **Nginx** reverse proxy

Default credentials: `admin` / `Password` (change in `docker-compose.yml` for production).

### 3. Build the synk CLI

```bash
cd ode/synkronus-cli
go build -o synk ./cmd/synkronus/
./synk login --username admin --password Password
```

### 4. Install Formulus dependencies

```bash
cd ode/formulus
npm install
```

### 5. Deploy the full stack

From the RentFreely app directory:

```bash
cd RentFreely/app
npm install
npm run deploy
```

This builds the custom app, uploads it to the server, embeds it in the APK, and installs on a connected device.

## Server Configuration

### Docker Compose (`synkronus/docker-compose.yml`)

| Variable | Default | Description |
|---|---|---|
| `ADMIN_USERNAME` | `admin` | Default admin account |
| `ADMIN_PASSWORD` | `Password` | Default admin password |
| `JWT_SECRET` | (set in file) | JWT signing key — **change for production** |
| `DB_CONNECTION` | (set in file) | PostgreSQL connection string |
| `APP_BUNDLE_PATH` | `/app/data/app-bundles` | Where bundles are stored |
| `MAX_VERSIONS_KEPT` | `5` | Number of bundle versions to retain |

### Changing the server URL

Update the default URL in Formulus so the mobile app points to your server:

```
formulus/src/services/ServerConfigService.ts → DEFAULT_SERVER_URL
```

Then update the synk CLI:

```bash
./synk config set api.url https://your-server.example.com
./synk login --username admin
```

## Formulus Customizations

Key files modified for RentFreely (relative to upstream ODE):

| File | Change |
|---|---|
| `formulus/src/screens/AuthScreen.tsx` | Login/register screen with reactive auth state |
| `formulus/src/screens/HomeScreen.tsx` | Version-aware pre-bundle extraction, silent bundle updates |
| `formulus/src/navigation/MainAppNavigator.tsx` | Conditional auth flow with `notifyAuthStateChanged` |
| `formulus/src/services/SyncService.ts` | `waitForSyncComplete()`, silent bundle updates |
| `formulus/src/services/ServerConfigService.ts` | Pre-configured server URL for RentFreely |
| `formulus/src/webview/FormulusMessageHandlers.ts` | `onSyncNow` waits for in-progress sync |
| `synkronus/internal/handlers/auth.go` | Public `/auth/register` endpoint |
| `synkronus-cli/internal/cmd/auth.go` | `--password` flag for non-interactive login |

## Pulling Upstream ODE Updates

This repo tracks the upstream ODE project. To pull new features or fixes:

```bash
git remote add upstream https://github.com/OpenDataEnsemble/ode.git  # once
git fetch upstream
git merge upstream/dev
```

Resolve any conflicts, test, and push to your private repo:

```bash
git push private main
```

## Related

- **[rentfreely](https://github.com/najuna-brian/rentfreely)** — Custom React app (UI, forms, deploy script)
- **[OpenDataEnsemble/ode](https://github.com/OpenDataEnsemble/ode)** — Upstream ODE project

## License

Private — All rights reserved.

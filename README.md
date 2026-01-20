# BananaDash

BananaDash is a self-hosted bookmark dashboard I built after using **Dashy for years** and hitting its limits: slow feature progress, non-interactive organization, and editing that often requires manually changing config files. BananaDash keeps the “dashboard” feel, but makes everything **interactive**, **multi-user**, and easy to manage from the UI.

<img width="800" height="auto" alt="Bildschirmfoto_20260119_232201" src="https://github.com/user-attachments/assets/aa4d090b-7316-47dd-8652-87e5a06bd554" />


## Live Demo (Demo Account)

You can try BananaDash without installing anything:

- **Demo URL:** https://bananadash.gerald-hasani.com/
- **Username:** `demo`
- **Password:** `demo1234`

> Note: The demo instance may be reset from time to time.

<br>

## Why BananaDash (instead of Dashy)?

I wanted a tool that fixes the everyday friction I had with Dashy:

- **Interactive organization**: Reorder **Spaces** and **Categories** via **drag & drop** (no more “I wish this was above that”).
- **Real editing in the UI**: Delete and edit items directly with an **Edit** button — no manual config file edits.
- **Automatic favicons**: When you add a bookmark, BananaDash can automatically use the site’s **favicon** (Dashy often requires logo URLs).
- **Easy icon handling**: Upload and use your own icons without dealing with external logo links.
- **Multi-user & login**: Built-in authentication + roles (Dashy doesn’t provide this out of the box).
- **Backup & restore**: Simple built-in backup/restore workflow that just works.

<br>

## Overview

BananaDash organizes everything in a clean hierarchy:

**Spaces → Categories → Bookmarks**

Use separate spaces for different contexts (e.g., **Private** and **Work**) to keep your links structured and easy to find.

<br>

## Key Features

### Organization & Management

- 📚 **Hierarchy**: Organize with **Spaces**, **Categories**, and **Bookmarks**
- 🖱️ **Drag & Drop**: Reorder Spaces and Categories by dragging them
- ✏️ **Edit Button**: Quickly edit or delete Spaces, Categories, and Bookmarks
- 🔍 **Search**: Fast search across your bookmarks

### Icons, Layout & Customization

- 🖼️ **Favicon Fetching**: Automatically uses the website favicon for new bookmarks (when available)
- 🖼️ **Icon Upload**: Upload custom icons for Spaces, Categories, and Bookmarks
- 🎨 **Theme Switching**: Toggle between **Dark** and **Light** mode
- 🎨 **Custom CSS**: Create your own look with custom CSS  
  → See [Custom-CSS-Lemon.md](Custom-CSS-Lemon.md) for examples
- 📐 **Flexible Layouts**: Auto, Vertical, and Horizontal modes with adjustable item sizes

### Administration

- 👥 **Account Management**: Admins can create/delete users and enable/disable public registration
- 💾 **Backup & Restore**: Export your data and restore it later
- 🔄 **Update Check**: Background update checks with notifications

### Security & Usability

- 🔐 **Security**: JWT auth, rate limiting, Helmet security headers
- 📱 **Responsive UI**: Works on Desktop, Tablet, and Mobile
- 🎯 **Onboarding Tour**: Interactive tutorial for first-time users

<br>

## How It Works

### Spaces, Categories & Bookmarks

1. **Create Spaces**: Separate contexts (e.g., “Private”, “Work”)
2. **Add Categories**: Organize within a space (e.g., “Development”, “Design”, “News”)
3. **Add Bookmarks**: Save links with title, URL, and optional icon
4. **Organize**: Use **Edit** and **drag & drop** to keep everything tidy

### Customization

- **Themes**: Switch between Dark and Light mode in Settings
- **Custom CSS**: Use the CSS Editor for advanced customization  
  → See [Custom-CSS-Lemon.md](Custom-CSS-Lemon.md) for a full example

### Administration

- **Users**: Admins manage accounts and registration settings
- **Backups**: Download a ZIP backup and restore it later if needed
- **Updates**: The app checks for updates in the background and notifies you

<br>

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Zustand
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Deployment**: Docker, Docker Compose
- **Security**: JWT, bcrypt, Helmet, CORS, rate limiting

## Quickstart

### Prerequisites

- Docker + Docker Compose
- Git (optional)

### Installation

1. **Clone or download**
   ```bash
   git clone https://github.com/Gerald-Ha/BananaDash.git
   cd BananaDash
```

2. **Start with Docker Compose**

   ```bash
   docker compose up -d
   ```

3. **Initial setup**

   * Open `http://localhost:1337`
   * You’ll be redirected to the Bootstrap page
   * Create the first admin account

4. **Done**

   * App: `http://localhost:1337`
   * MongoDB: `localhost:27020` (optional, for direct access)
   
> Want to try it first? Use the demo: [https://bananadash.gerald-hasani.com/](https://bananadash.gerald-hasani.com/) (demo / demo1234)

<br>

## Configuration

The defaults work out of the box, but these environment variables are worth knowing:

* `JWT_SECRET`: Secret for JWT tokens (default: `change-me` — **change this in production**)
* `CLIENT_URL`: Frontend URL (default: `http://localhost:1337`)
* `ALLOW_REGISTRATION_DEFAULT`: Default registration status (default: `false`)
* `DISABLE_CSP`: For local development this may be `true`; for production you usually want CSP enabled

For the full configuration, see [Dokumentation.md](Dokumentation.md).

<br>

## Operations

### View Logs

```bash
docker compose logs -f app
```

### Stop Containers

```bash
docker compose down
```

### Restart Containers

```bash
docker compose restart
```

### Update Application

```bash
git pull
docker compose up -d --build
```

<br>

## Customization Examples

### Custom CSS Themes

BananaDash supports custom CSS themes. See [Custom-CSS-Lemon.md](Custom-CSS-Lemon.md) for a complete example (bright yellow/green accents).

To use custom CSS:

1. Go to **Menu → Settings** (or **CSS Editor**)
2. Select **Theme mode: Custom**
3. Paste your CSS into the **Custom CSS** textarea
4. Click **Save**

You can target specific UI areas using data attributes like:

* `[data-bd="p1"]` (header)
* `[data-bd="p2"]` (toolbar)
* etc.

<br>

## License

MIT License — see repository for details.

<br>

## Credits

Developed by [Gerald Hasani](https://github.com/Gerald-Ha)





# Groot Version Control System

A simple, educational version control system inspired by Git, with a CLI, web frontend, and Node.js/Express backend.

---

## Features
- Initialize repositories
- Add and commit files
- Push and pull repositories to/from a remote server
- View commit logs and diffs
- User authentication (login, logout, signup)
- Web frontend for managing repos and files
- **Official CLI npm package for global use**
- **Dockerized backend for easy deployment**

---

## Directory Structure
```
v1_version_control/
  cli/         # Command-line interface
  frontend/    # React web frontend
  server/      # Node.js/Express backend (Dockerized)
```

---

## 🚀 CLI Usage via npm (groot-vcs-cli)

### Install globally:
```sh
npm install -g groot-vcs-cli
```

### Usage:
```sh
groot <command>
```

### Example commands:
- `groot login`                : Log in to your account
- `groot init`                 : Initialize a new repository
- `groot add <file>`           : Add a file to the staging area
- `groot commit <message>`     : Commit staged files with a message
- `groot push <repo>`          : Push commits to the remote server
- `groot pull <repo>`          : Pull latest commits from the remote server
- `groot log`                  : Show commit history
- `groot show <commitHash>`    : Show diff for a specific commit
- `groot listall`              : List all your repositories
- `groot logout`               : Log out of your account

> **Note:** The CLI always uses the official backend API URL. No configuration is needed.

---

## 🐳 Dockerized Backend (Node.js/Express)

- The backend is fully dockerized for easy deployment.
- Example `Dockerfile` (uses Node 22 Alpine):
  ```Dockerfile
  FROM node:22-alpine
  RUN apk add --no-cache python3 make g++
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 5000
  CMD ["node", "server.js"]
  ```
- Add a `.dockerignore` to exclude `node_modules`, `.env`, etc.
- The server uses environment variables for configuration:
  - `PORT` (Render sets this automatically)
  - `MONGODB_URI`
  - `JWT_SECRET`

### **Deploying to Render:**
1. Push your code (with Dockerfile) to GitHub.
2. Create a new Web Service on [Render](https://render.com/), select Docker, and connect your repo.
3. Set environment variables in the Render dashboard.
4. Deploy! Render will give you a public API URL (e.g., `https://groot-backend.onrender.com`).

---

## 🌐 Frontend (React + Vite)

- The frontend uses Vite and supports environment variables for the API URL.
- In `frontend/.env`:
  ```
  VITE_API_URL=https://groot-backend.onrender.com
  ```
- In your code:
  ```js
  const API = import.meta.env.VITE_API_URL;
  ```
- Deploy to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/).
- Set `VITE_API_URL` in the dashboard for production.

---

## Getting Started (Development)
1. **Install dependencies** in each subdirectory (`cli/`, `frontend/`, `server/`):
   ```sh
   npm install
   ```
2. **Start the backend server** (locally):
   ```sh
   cd server && npm start
   ```
3. **Start the frontend**:
   ```sh
   cd frontend && npm run dev
   ```
4. **Use the CLI**:
   ```sh
   cd cli
   node index.js <command>
   ```

---

## Notes
- All file content is stored and transferred as base64 for consistency.
- Only the file content is versioned (no directories, symlinks, or file permissions).
- This project is for educational/demo purposes and is not a full replacement for Git.

---

## License
MIT 
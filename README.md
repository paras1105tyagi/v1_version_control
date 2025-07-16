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

---

## Directory Structure
```
v1_version_control/
  cli/         # Command-line interface
  frontend/    # React web frontend
  server/      # Node.js/Express backend
```

---

## CLI Commands
Run from the `cli/` directory:

- `init`                : Initialize a new repository
- `add <file>`          : Add a file to the staging area
- `commit <message>`    : Commit staged files with a message
- `push <repo>`         : Push commits to the remote server
- `pull <repo>`         : Pull latest commits from the remote server
- `log`                 : Show commit history
- `show <commitHash>`   : Show diff for a specific commit
- `listall`             : List all your repositories
- `login`               : Log in to your account
- `logout`              : Log out of your account

---

## API Endpoints
All endpoints are prefixed with `/repo` or `/auth` and run on the backend server (default: `http://localhost:5000`).

### Auth
- `POST   /auth/signup`         : Create a new user
- `POST   /auth/login`          : Log in and receive a token
- `POST   /auth/logout`         : Log out (client-side only)
- `DELETE /auth/user`           : Delete your account

### Repo
- `POST   /repo/`               : Create a new repository
- `GET    /repo/`               : List your repositories
- `DELETE /repo/:id`            : Delete a repository
- `POST   /repo/:name/add-file` : Add (stage) a file to a repo
- `POST   /repo/:name/commit`   : Commit staged files
- `POST   /repo/:name/push`     : Push a commit (CLI only)
- `GET    /repo/:name/pull`     : Pull all commits (with file content)
- `GET    /repo/:name/log`      : Get commit history
- `GET    /repo/:name/diff/:commitHash` : Get diff for a commit

---

## Web Frontend
- Start with `npm run dev` in the `frontend/` directory
- Features:
  - Sign up, log in, log out
  - Create, list, and delete repositories
  - Add files, commit, push, pull
  - View commit history and diffs
  - Browse files in latest commit

---

## Getting Started
1. **Install dependencies** in each subdirectory (`cli/`, `frontend/`, `server/`):
   ```sh
   npm install
   ```
2. **Start the backend server**:
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
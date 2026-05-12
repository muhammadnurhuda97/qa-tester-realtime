# Deployment Guide: Shared Hosting (Node.js)

Aksara Go QA is now back to a **Node.js** architecture for superior real-time performance.

## 1. Build the Application
Run the build command on your local machine:

```bash
npm run build
```

This will create a `dist` folder containing:
- `assets/` (Frontend)
- `index.html` (Entry point)
- `server.js` (Backend bundled for production)

## 2. Setup on Hosting (cPanel)
1. Upload the contents of the `dist` folder to your server (e.g., `/home/username/qa-app`).
2. Open **"Setup Node.js App"** in cPanel.
3. Click **"Create Application"**.
4. **Application root**: Path to your folder (e.g., `qa-app`).
5. **Application URL**: Your domain/path.
6. **Application startup file**: `server.js`.
7. Click **"Create"**.
8. Click **"Run NPM Install"** if needed (though `server.js` is bundled).

## 3. Local Production Test
To test the production build on your computer:
```bash
npm run preview
```
*(Open http://localhost:3000)*

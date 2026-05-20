<div align="center">
  <img src="karakokey.png" alt="Karakokey Logo" width="200" />
  <h1>Karakokey</h1>
  <p>Developed by <strong>RyannKim327</strong> under <i>MPOP Reverse II</i></p>
</div>

Karakokey is a modern, web-based karaoke platform that leverages Tubidy for its song library, serving as a digitalized version of the KTV or karaoke machines loved by most Filipinos. It features a Svelte-powered frontend for a smooth user experience and a Node.js backend to handle search, streaming, and real-time synchronization via WebSockets.

---

## 📖 How to Use

1. **Visit the App:** Go to [ryannkim327.is-a.dev/karakokey](https://ryannkim327.is-a.dev/karakokey).
2. **Create a Room:** Click on the "Create Room" button to start a new karaoke session.
3. **Connect Devices:**
   - Scan the **QR Code** displayed on the screen with another device (like your phone).
   - Alternatively, manually input the **Room ID** (the code given by the room) on the join page.
4. **Start Singing:** Use the connected device to search for songs and add them to the queue!

---

## 🚀 Tech Stack

### Frontend
- **Framework:** [Svelte 5](https://svelte.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Routing:** [svelte-spa-router](https://github.com/luizpostiga/svelte-spa-router)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express](https://expressjs.com/)
- **Real-time:** [WebSockets (ws)](https://github.com/websockets/ws)
- **Search Integration:** Tubidy
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## 📁 Project Structure

```text
karakokey/
├── frontend/           # Svelte application
│   ├── src/            # Components, routes, and assets
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies and scripts
├── backend/            # Express server
│   ├── src/            # Server logic and YT integration
│   ├── leapcell.yaml   # Leapcell deployment config
│   └── package.json    # Backend dependencies and scripts
├── CHANGELOG.md        # Track changes and updates
├── LICENSE             # Non-Commercial License
└── README.md           # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd karakokey
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install Frontend
   cd frontend && npm install
   
   # Install Backend
   cd ../backend && npm install
   ```

### Running Locally

**Start Backend:**
```bash
cd backend
npm start
```
The server will start on `http://localhost:3000` (or the port defined in your environment).

**Start Frontend:**
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🚢 Deployment

### Frontend (GitHub Pages)
The frontend is configured to deploy to GitHub Pages.
```bash
cd frontend
npm run deploy
```

---

## 📜 License & Changelog

- **License:** This project is licensed under a [Non-Commercial License](LICENSE.md). It **must not** be commercialized or sold online.
- **Changelog:** Stay updated with the latest changes in the [CHANGELOG.md](CHANGELOG.md).

---

## 🤖 AI Guide

- **Claude AI:** Youtubei.js
- **ChatGPT:** Design
- **Gemini:** Websocket webscrape and documentation

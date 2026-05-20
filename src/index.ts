import express from "express"
import cors from "cors"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"
import { play, search } from "./script/tubidy"

const app = express()
const server = createServer(app)
const port = process.env.PORT || 3000

app.use(cors())

app.get("/", (req, res) => {
	res.json({ response: "Server currently running" })
})

app.get("/search", async (req, res) => {
	const q = req.query.q
	if (typeof q !== "string") {
		return res.status(400).json({ error: "Please provide a valid search query" })
	}
	const lists = await search(q)
	res.json(lists)
})

app.get("/play", async (req, res) => {
	const id = req.query.id
	if (typeof id !== "string") {
		return res.status(400).send("Missing or invalid id")
	}
	try {
		// await play(id, res)
		const p = await play(id)
		res.json(p)
	} catch (err) {
		console.error(err)
		res.status(500).send("Failed to stream video")
	}
})

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Endpoint not found" })
})

// ✅ Attach WS to the SAME server (no separate port!)
const wss = new WebSocketServer({ port: 8080 })

type ExtendedWebSocket = WebSocket & { isAlive: boolean; role?: string }
const channels = new Map<string, Set<ExtendedWebSocket>>()

wss.on("connection", (ws: ExtendedWebSocket, req) => {
	const url = new URL(req.url || "", `https://${req.headers.host}`)
	const channel = url.pathname.replace(/^\/ws\/?/, "") || "default"
	const role = url.searchParams.get("role") || "book"

	if (!channels.has(channel)) {
		channels.set(channel, new Set())
	}

	const clients = channels.get(channel)!

	if (role === "video") {
		const hasVideo = Array.from(clients).some((client) => client.role === "video")
		if (hasVideo) {
			console.log(`Connection rejected: Video device already exists in channel ${channel}`)
			ws.close(1008, "Video device already connected")
			return
		}
	}

	ws.role = role
	clients.add(ws)

	ws.on("message", (data) => {
		clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data.toString())
			}
		})
	})

	ws.on("close", (code, reason) => {
		clients.delete(ws)
		console.log(`Client (${role}) disconnected from channel: ${channel}. Code: ${code}, Reason: ${reason}`)
	})
})

// ✅ Bind to 0.0.0.0 so your phone can reach it
server.listen(port as number, () => {
	console.log(`Listening on http://0.0.0.0:${port}`)
	console.log(`WebSocket on ws://0.0.0.0:${port}`)
})

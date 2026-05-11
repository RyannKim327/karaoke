import express from "express"
import cors from "cors"
import { createServer } from "http"
import { WebSocketServer, WebSocket } from "ws"
import { play, search } from "./script/yt"

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
		await play(id, res)
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

const channels = new Map<string, Set<WebSocket & { isAlive: boolean }>>()

wss.on("connection", (ws: WebSocket & { isAlive: boolean }, req) => {
	const channel = req.url?.replace(/^\/ws\/?/, "") || "default"

	if (!channels.has(channel)) {
		channels.set(channel, new Set())
	}
	channels.get(channel)!.add(ws)

	ws.on("message", (data) => {
		channels.get(channel)?.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data.toString())
			}
		})
	})

	ws.on("close", () => {
		channels.get(channel)?.delete(ws)
		console.log(`Client disconnected from channel: ${channel}`)
	})
})

// ✅ Bind to 0.0.0.0 so your phone can reach it
server.listen(port as number, () => {
	console.log(`Listening on http://0.0.0.0:${port}`)
	console.log(`WebSocket on ws://0.0.0.0:${port}`)
})

import { Hono } from "hono"
import { cors } from "hono/cors"
import { search, play } from "./script/yt.js"
import { stream } from "hono/streaming"

export const app = new Hono()

app.use("*", cors())

app.get("/", (c) => {
	return c.json({ response: "Server currently running" })
})

app.get("/search", async (c) => {
	const q = c.req.query("q")
	if (typeof q !== "string") {
		return c.json({ error: "Please provide a valid search query" }, 400)
	}
	const lists = await search(q)
	return c.json(lists)
})

app.get("/play", async (c) => {
	const id = c.req.query("id")
	if (typeof id !== "string") {
		return c.text("Missing or invalid id", 400)
	}
	
	try {
		return stream(c, async (stream) => {
			c.header("Content-Type", "video/mp4")
			c.header("Accept-Ranges", "bytes")
			
			const readable = await play(id, {
				setHeader: (name: string, value: string) => c.header(name, value),
				end: () => stream.close(),
				on: (event: string, cb: any) => {},
			})

			for await (const chunk of readable) {
				await stream.write(chunk)
			}
		})
	} catch (err) {
		console.error(err)
		return c.text("Failed to stream video", 500)
	}
})

app.notFound((c) => {
	return c.json({ error: "Endpoint not found" }, 404)
})

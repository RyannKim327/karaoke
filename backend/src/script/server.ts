import http, { IncomingMessage, ServerResponse } from "http"

type serverContent = (req: IncomingMessage, res: ServerResponse) => void
type serverProps = Record<string, serverContent>

export default function server(endpoints: serverProps) {
	const server = http.createServer(async (req, res) => {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
		res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length');

		if (req.method === 'OPTIONS') {
			res.statusCode = 204;
			return res.end();
		}

		const url = req.url?.split("?")[0] ?? ""

		const hand = Object.keys(endpoints).includes(url) ? endpoints[url] : endpoints["/404"]
		await hand(req, res)

	})
	return server
}

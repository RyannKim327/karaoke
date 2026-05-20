import axios from "axios"
import * as cheerio from "cheerio"

const endpoint = "https://mp3.tubidy.cool"

export async function search(song: string) {
	let results: { id: string | undefined; link: string; title: string | undefined }[] = []
	let pages = 1
	while (results.length <= 0 && pages <= 3) {
		const { data } = await axios.get(`${endpoint}/search.php`, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
			},
			params: {
				q: `${song} karaoke`,
				si: 7,
				pn: 1
			}
		})
		const $ = cheerio.load(data)
		const html = $("div.media-body")

		html.each((i, e) => {
			const content = $(e).find("a")
			const href = content.attr("href")
			const title = content.attr("aria-label")

			if (href) {
				const link = href.startsWith("//") ? `https:${href}` : href.startsWith("/") ? `${endpoint}${href}` : href
				const idMatch = href.match(/\/watch\/([^\/]+)/)
				const id = idMatch ? idMatch[1] : undefined
				if (id && !href.includes("act=process")) {
					results.push({
						id,
						link,
						title
					})
				}
			}
		})
		pages++
	}

	return results
}

export async function play(id: string) {
	const { data } = await axios.get(`${endpoint}/watch.php`, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
		},
		params: {
			id,
			p: "mp4",
			t: "ssl",
			act: "down",
			lnk: 3
		}
	})
	const $ = cheerio.load(data)
	const items = $("li.list-group-item.big")
	let play: string | undefined
	let download: string | undefined
	let isProcess: boolean = false

	items.each((i, e) => {
		const a = $(e).find("a")
		const text = a.text().toLowerCase()
		const href = a.attr("href")

		if (href) {
			isProcess = href?.includes("act=process")
		}

		if (text.includes("play")) {
			play = href
		} else if (text.includes("download")) {
			download = href
		}
	})

	if (isProcess) {
		return {
			error: "This video is in process, probably error from the hosts"
		}
	}

	return {
		url: play,
		download
	}
}

import axios from "axios"
import * as cheerio from "cheerio"

const endpoint = "https://mp3.tubidy.cool"

export async function search(song: string) {
	const { data } = await axios.get(`${endpoint}/search.php?q=${encodeURIComponent(song + " karaoke")}`, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
		}
	})
	const $ = cheerio.load(data)
	const html = $("div.media-body")
	let results: { id: string | undefined; link: string; title: string | undefined }[] = []

	html.each((i, e) => {
		const content = $(e).find("a")
		const href = content.attr("href")
		const title = content.attr("aria-label")

		if (href) {
			const link = href.startsWith("//") ? `https:${href}` : href.startsWith("/") ? `${endpoint}${href}` : href
			const idMatch = href.match(/\/watch\/([^\/]+)/)
			const id = idMatch ? idMatch[1] : undefined

			results.push({
				id,
				link,
				title
			})
		}
	})

	return results
}

export async function play(id: string) {
	const { data } = await axios.get(`${endpoint}/watch.php?id=${id}&p=mp4&t=ssl&act=down&lnk=3`, {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
		}
	})
	const $ = cheerio.load(data)
	const items = $("li.list-group-item.big")
	let play: string | undefined
	let download: string | undefined

	items.each((i, e) => {
		const a = $(e).find("a")
		const text = a.text().toLowerCase()
		const href = a.attr("href")

		if (text.includes("play")) {
			play = href
		} else if (text.includes("download")) {
			download = href
		}
	})

	return {
		url: play,
		download
	}
}

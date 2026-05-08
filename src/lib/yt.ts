import { Innertube } from "youtubei.js";

export async function YTSearch(song: string) {
	const youtube = await Innertube.create()
	const results = await youtube.search(song)
	return results.videos
}

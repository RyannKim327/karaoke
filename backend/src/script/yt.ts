import { Innertube } from "youtubei.js"

export async function search(song: string) {
	const yt = await Innertube.create()
	const result = await yt.search(`${song} karaoke`)
	return result.videos
}


export async function play(ytID: string) {
	const yt = await Innertube.create()
	const info = await yt.getInfo(ytID)

	// console.log(JSON.stringify(info.streaming_data, null, 2))
	//
	// const formats = info.streaming_data?.formats || []
	//
	// const format = formats.find((f) => {
	// 	f.mime_type?.includes("video/mp4")
	// })

	return info.streaming_data.server_abr_streaming_url
}

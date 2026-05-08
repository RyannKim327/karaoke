import Home from "@/routes/home.svelte"
import Video from "@/routes/video.svelte"

export default {
	"/": Home,
	"/stream/:id": Video
}

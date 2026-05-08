import Book from "@/routes/book.svelte"
import Home from "@/routes/home.svelte"
import Video from "@/routes/video.svelte"

export default {
	"/": Home,
	"/stream/:id": Video,
	"/book/:id": Book
}

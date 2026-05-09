<script lang="ts">
	import { onMount } from "svelte";

	interface SongInfo {
		title: string;
		url: string;
		play?: boolean;
	}

	export let params: { id: string };

	let socket: WebSocket;
	let sources: SongInfo[] = [];
	let source = "";

	async function playSong() {}

	onMount(() => {
		socket = new WebSocket(`ws://localhost:8080/${params.id}`);

		socket.onopen = () => {
			console.log("Initiated");

			socket.send(
				JSON.stringify({
					play: true,
				}),
			);
		};

		socket.onmessage = (event: MessageEvent) => {
			const data: SongInfo = JSON.parse(event.data);

			if (data.check) {
				socket.send(
					JSON.stringify({
						play: true,
					}),
				);
			}

			if (data.title) {
				sources = [...sources, data];
				// optional: auto set current video source
				if (!source) {
					source = data.url;
				}
			}

			console.log(sources);
		};

		socket.onerror = (error: Event) => {
			console.error(error);
		};

		socket.onclose = () => {
			console.log("Disconnected");
			socket.send(JSON.stringify({ play: false }));
		};

		return () => {
			socket.close();
		};
	});
</script>

<div class="relative w-full h-screen overflow-hidden bg-black">
	{#if source}
		<video
			class="absolute inset-0 w-full h-full object-cover"
			src={source}
			autoplay
			controls
		/>
	{:else}
		<div
			class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black"
		>
			<div class="text-center">
				<div class="text-6xl mb-4">🎤</div>
				<h1 class="text-white text-3xl font-bold">Kara Kokey</h1>
				<p class="text-zinc-400 mt-2">Waiting for songs...</p>
			</div>
		</div>
	{/if}

	<div class="absolute top-0 left-0 w-full p-4 md:p-6 z-10">
		<div
			class="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl px-4 py-3 shadow-2xl overflow-hidden"
		>
			<div
				class="shrink-0 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold tracking-wider text-white shadow-lg"
			>
				{params.id.toUpperCase()}
			</div>

			<div class="min-w-0 flex-1 overflow-hidden">
				<p
					class="truncate whitespace-nowrap text-sm md:text-base text-white/90"
				>
					{#if sources.length > 0}
						{sources.map((s) => s.title).join(", ")}
					{:else}
						No songs in queue yet...
					{/if}
				</p>
			</div>
		</div>
	</div>

	<div
		class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none"
	/>
</div>

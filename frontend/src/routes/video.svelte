<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { API_HOST, WS_HOST } from "@/config";
	import { YIN } from "pitchfinder";

	interface SongInfo {
		title: string;
		url: string;
		play?: boolean;
		check?: boolean;
	}
	export let params: { id: string };

	const yin = YIN();

	let socket: WebSocket;
	let sources: SongInfo[] = [];
	let source = "";
	let id = "";
	let video;
	let paused = false;
	let currentBlobUrl: string | null = null;
	let score: number | null = null;
	let showScore = false;
	let started = false;

	function getScoreMessage(s: number) {
		if (s >= 90)
			return {
				msg: "Wow, you're a great singer! 🌟",
				color: "text-yellow-400",
			};
		if (s >= 75)
			return { msg: "Amazing performance! 🎉", color: "text-green-400" };
		if (s >= 60)
			return { msg: "Not bad, keep it up! 👏", color: "text-blue-400" };
		if (s >= 45)
			return {
				msg: "Getting there, practice more! 💪",
				color: "text-orange-400",
			};
		return { msg: "Maybe stick to the shower... 🚿", color: "text-red-400" };
	}

	function generateScore() {
		score = Math.floor(Math.random() * 101);
		showScore = true;
		setTimeout(() => {
			showScore = false;
			score = null;
		}, 4000);
	}

	function audioAnalyzer(stream) {
		const audio = new AudioContext();
		const src = audio.createMediaStreamSource(stream);

		const analyzer = audio.createAnalyser();
		analyzer.fftSize = 2048;

		src.connect(analyzer);

		const buffer = new Float32Array(analyzer.fftSize);

		function tick() {
			analyzer.getFloatTimeDomainData(buffer);

			const pitch = yin(buffer);

			if (pitch) {
				console.log("Pitch:", pitch);
				hzToMidi(pitch);
			}

			requestAnimationFrame(tick);
		}

		tick();
	}

	function getVideoStream() {
		if (!video) return;
		const stream = video.captureStream();
		const audioCtx = new AudioContext();

		const source = audioCtx.createMediaStreamSource(stream);
	}

	async function getUrl(videoId: string) {
		if (sources.length > 0) {
			source = `${API_HOST}/play?id=${videoId}`;
			setTimeout(() => {
				if (video) video.play();
			}, 500);
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			audioAnalyzer(stream);
		} else {
			source = "";
		}
	}

	function nextSong() {
		setTimeout(() => {
			if (sources.length > 0) {
				id = sources[0].url;
				getUrl(id);
			} else {
				source = "";
				id = "";
				started = false;
			}
			sources.shift();
		}, 4000); // wait for score to show before next song
	}

	function nativeNextSong() {
		generateScore();
		setTimeout(() => {
			if (sources.length > 0) {
				id = sources[0].url;
				getUrl(id);
			} else {
				source = "";
				id = "";
				started = false;
			}
			sources.shift();
		}, 4000); // wait for score to show before next song
	}

	function startPlay() {
		if (!started) {
			const id = sources[0].url;
			getUrl(id);
			sources.shift();
			started = true;
		}
	}

	function hzToMidi(hz) {
		return 69 + 12 * Math.log2(hz / 440);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.code === "Space") {
			e.preventDefault();
			if (paused) {
				paused = false;
				video?.play();
			} else {
				paused = true;
				video?.pause();
			}
		}
		if (e.code === "ArrowRight") {
			nextSong();
		}
	}

	onMount(() => {
		window.addEventListener("keydown", handleKeydown);
		socket = new WebSocket(`${WS_HOST}/${params.id}`);
		socket.onopen = () => {
			console.log("Socket connected");
			socket.send(JSON.stringify({ play: true }));
			fullscreen();
		};
		socket.onmessage = (event: MessageEvent) => {
			const data: SongInfo = JSON.parse(event.data);
			console.log("Received:", data);
			if (data.check) {
				socket.send(JSON.stringify({ play: true }));
			}
			if (data.title) {
				sources = [...sources, data];
				startPlay();
			}
		};
		socket.onerror = (error: Event) => console.error("Socket error:", error);
		socket.onclose = () => console.log("Socket disconnected");
	});

	onDestroy(() => {
		window.removeEventListener("keydown", handleKeydown);
		if (socket) socket.close();
		if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
	});

	async function fullscreen() {
		await document.documentElement.requestFullscreen();
	}
</script>

<div class="relative w-full h-screen overflow-hidden bg-black">
	{#if source}
		<video
			class="absolute inset-0 h-full w-full"
			src={source}
			autoplay={true}
			controls={false}
			onpause={() => {
				if (!paused) video?.play();
			}}
			playsinline
			onended={nativeNextSong}
			bind:this={video}
		></video>
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

	<!-- Score overlay -->
	{#if showScore && score !== null}
		<div
			class="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-sm"
		>
			<div class="text-center animate-bounce">
				<p class="text-white/60 text-xl mb-2 font-medium">Your Score</p>
				<p class="text-8xl font-black text-white mb-4">{score}</p>
				<p class="text-2xl font-bold {getScoreMessage(score).color}">
					{getScoreMessage(score).msg}
				</p>
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

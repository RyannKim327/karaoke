<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { API_HOST, WS_HOST } from "@/lib/config";
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
	let video: HTMLVideoElement;
	let paused = false;
	let currentBlobUrl: string | null = null;
	let score: number | null = null;
	let showScore = false;
	let started = false;
	let framesWithPitch = 0;
	let totalFrames = 0;
	let analyzerActive = false;
	let micStream: MediaStream | null = null;

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
		video?.pause();
		if (totalFrames > 0) {
			// Calculate score based on percentage of frames where pitch was detected
			// We use a multiplier to make it a bit more generous
			const ratio = framesWithPitch / totalFrames;
			score = Math.min(100, Math.floor(ratio * 300)); // 33% detection = 100 score
		} else {
			score = Math.floor(Math.random() * 20) + 10; // Low random score if no data
		}

		showScore = true;
		analyzerActive = false;

		// Reset counters for next song
		framesWithPitch = 0;
		totalFrames = 0;

		setTimeout(() => {
			showScore = false;
			score = null;
		}, 5000);
	}

	function audioAnalyzer(stream: MediaStream) {
		if (analyzerActive) return;
		analyzerActive = true;

		const audio = new AudioContext();
		const src = audio.createMediaStreamSource(stream);

		const analyzer = audio.createAnalyser();
		analyzer.fftSize = 2048;

		src.connect(analyzer);

		const buffer = new Float32Array(analyzer.fftSize);

		function tick() {
			if (!analyzerActive) {
				audio.close();
				return;
			}

			analyzer.getFloatTimeDomainData(buffer);

			const pitch = yin(buffer);

			if (pitch && pitch > 50 && pitch < 2000) {
				// Basic filter for human voice range
				framesWithPitch++;
			}
			totalFrames++;

			requestAnimationFrame(tick);
		}

		tick();
	}

	async function getUrl(link: string) {
		paused = false;
		if (sources.length > 0) {
			source = link;
			setTimeout(() => {
				if (video) video.play();
			}, 500);

			if (!micStream) {
				micStream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
			}
			audioAnalyzer(micStream);
		} else {
			source = "";
		}
	}

	function nextSong() {
		paused = true;
		video?.pause();
		analyzerActive = false;
		framesWithPitch = 0;
		totalFrames = 0;
		if (sources.length > 0) {
			id = sources[0].url;
			getUrl(id);
		} else {
			source = "";
			id = "";
			started = false;
		}
		sources.shift();
	}

	function nativeNextSong() {
		paused = true;
		video?.pause();
		generateScore();
		source = "";
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
		if (!started && sources.length > 0) {
			id = sources[0].url;
			getUrl(id);
			sources.shift();
			started = true;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (showScore) return;
		if (e.code === "Space") {
			e.preventDefault();
			if (paused) {
				paused = false;
				video?.play();
				startHeaderTimer();
			} else {
				paused = true;
				video?.pause();
				showHeader();
			}
		}
		if (e.code === "ArrowRight") {
			nextSong();
		}
		if (e.code === "KeyF") {
			fullscreen();
		}
	}

	onMount(() => {
		window.addEventListener("keydown", handleKeydown);
		socket = new WebSocket(`${WS_HOST}/${params.id.toLowerCase()}`);
		socket.onopen = () => {
			socket.send(JSON.stringify({ play: true }));
			fullscreen();
		};
		socket.onmessage = (event: MessageEvent) => {
			const data: SongInfo = JSON.parse(event.data);
			if (data.check) {
				socket.send(JSON.stringify({ play: true }));
				fullscreen();
			}
			if (data.title) {
				sources = [...sources, data];
				startPlay();
				fullscreen();
			}
		};
		socket.onerror = (error: Event) => console.error("Socket error:", error);
		socket.onclose = () => {
			console.log("Socket disconnected");
		};
	});

	onDestroy(() => {
		window.removeEventListener("keydown", handleKeydown);
		if (socket) socket.close();
		if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
		if (headerTimeout) clearTimeout(headerTimeout);
		analyzerActive = false;
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
				if (!paused && source) video?.play();
			}}
			playsinline
			onended={nativeNextSong}
			bind:this={video}
		></video>
	{:else}
		<div
			class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black"
		>
			<div class="text-center flex flex-col items-center">
				<div class="text-6xl mb-6">🎤</div>
				<h1 class="text-white text-5xl font-black tracking-tight mb-2">
					Kara Kokey
				</h1>
				<p class="text-zinc-400 text-lg mb-8">Scan to join and add songs</p>

				<div
					class="p-2 bg-white rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-8"
				>
					<img
						src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={encodeURIComponent(
							window.location.origin +
								window.location.pathname +
								'#/book/' +
								params.id,
						)}"
						alt="QR Code"
						class="w-25 h-25"
					/>
				</div>

				<div class="flex flex-col items-center gap-1">
					<p
						class="text-zinc-500 text-sm font-medium uppercase tracking-widest"
					>
						Room ID
					</p>
					<p class="text-white text-2xl font-mono font-bold">
						{params.id.toUpperCase()}
					</p>
				</div>
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
			class="flex items-center gap-3 px-4 py-3 overflow-hidden transition-all duration-500"
		>
			<div
				class="shrink-0 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold tracking-wider text-white shadow-lg"
			>
				{params.id.toUpperCase()}
			</div>
			<div
				class="min-w-0 flex-1 overflow-hidden"
				transition:fade={{ duration: 300 }}
			>
				<p
					class="truncate whitespace-nowrap text-sm md:text-base text-white/90
		[text-shadow:_-1px_-1px_0_#000,_1px_-1px_0_#000,_-1px_1px_0_#000,_1px_1px_0_#000]"
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

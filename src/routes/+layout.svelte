<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>InsightGrid - AI-Powered CSV Dashboard Generator</title>
	<meta
		name="description"
		content="Turn your CSVs into beautiful dashboards with AI-powered agents"
	/>
</svelte:head>

<!-- Modern Header -->
<header class="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl">
	<div class="mx-auto max-w-7xl px-6 py-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="relative">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-lg shadow-lg"
					>
						🧠
					</div>
				</div>
				<div>
					<h1
						class="bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent"
					>
						InsightGrid
					</h1>
					<p class="text-xs font-medium text-blue-200/80">AI-Powered Data Analytics Platform</p>
				</div>
			</div>
			<div class="hidden items-center gap-6 lg:flex">
				<div
					class="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5"
				>
					<div class="relative">
						<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></div>
						<div
							class="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400"
						></div>
					</div>
					<span class="text-xs font-medium text-emerald-300">AI Agents Online</span>
				</div>
			</div>
		</div>
	</div>
</header>

{@render children()}

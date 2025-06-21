<script>
	let {
		fileInput = $bindable(),
		uploadedFile = $bindable(),
		error = $bindable(),
		handleFileUpload
	} = $props();
</script>

<!-- Modern Hero Section -->
<div class="mb-20 text-center">
	<div class="mb-12">
		<div
			class="mb-8 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300"
		>
			<span class="mr-2">✨</span>
			Powered by Advanced AI Technology
		</div>
		<h2 class="mb-8 text-6xl leading-tight font-black tracking-tight text-white md:text-8xl">
			Transform
			<span
				class="animate-gradient bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent"
			>
				Data
			</span>
			<br />Into
			<span
				class="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
			>
				Intelligence
			</span>
		</h2>
		<p class="mx-auto max-w-4xl text-xl leading-relaxed font-light text-blue-100/80 md:text-2xl">
			Upload your CSV and watch our multi-agent AI system work like a complete data science team—
			<br class="hidden md:block" />
			<span class="font-medium text-cyan-300">cleaning, analyzing, and visualizing</span> your data automatically.
		</p>
	</div>

	<!-- Enhanced Feature Grid -->
	<div class="mx-auto mb-16 grid max-w-5xl gap-8 md:grid-cols-3">
		<div class="group relative">
			<div
				class="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 blur transition duration-300 group-hover:opacity-60"
			></div>
			<div
				class="relative rounded-3xl border border-cyan-300/20 bg-slate-900/80 p-8 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 hover:border-cyan-400/40"
			>
				<div class="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">🤖</div>
				<h3 class="mb-3 text-xl font-bold text-white">Multi-Agent AI System</h3>
				<p class="text-sm leading-relaxed text-blue-200/80">
					Specialized AI agents collaborate to analyze your data from multiple perspectives
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<span
						class="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300"
						>Data Cleaning</span
					>
					<span
						class="rounded-full border border-blue-400/30 bg-blue-500/20 px-2 py-1 text-xs text-blue-300"
						>Pattern Recognition</span
					>
				</div>
			</div>
		</div>
		<div class="group relative">
			<div
				class="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-30 blur transition duration-300 group-hover:opacity-60"
			></div>
			<div
				class="relative rounded-3xl border border-emerald-300/20 bg-slate-900/80 p-8 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 hover:border-emerald-400/40"
			>
				<div class="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">📊</div>
				<h3 class="mb-3 text-xl font-bold text-white">Smart Visualizations</h3>
				<p class="text-sm leading-relaxed text-blue-200/80">
					AI automatically selects and creates the perfect charts and graphs for your data type
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<span
						class="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300"
						>Auto-Charts</span
					>
					<span
						class="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300"
						>Interactive</span
					>
				</div>
			</div>
		</div>
		<div class="group relative">
			<div
				class="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-400 to-purple-500 opacity-30 blur transition duration-300 group-hover:opacity-60"
			></div>
			<div
				class="relative rounded-3xl border border-indigo-300/20 bg-slate-900/80 p-8 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 hover:border-indigo-400/40"
			>
				<div class="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">⚡</div>
				<h3 class="mb-3 text-xl font-bold text-white">Instant Intelligence</h3>
				<p class="text-sm leading-relaxed text-blue-200/80">
					Get comprehensive insights and beautiful dashboards in seconds, not hours
				</p>
				<div class="mt-4 flex flex-wrap gap-2">
					<span
						class="rounded-full border border-indigo-400/30 bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300"
						>Real-time</span
					>
					<span
						class="rounded-full border border-purple-400/30 bg-purple-500/20 px-2 py-1 text-xs text-purple-300"
						>Fast Analysis</span
					>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Modern Upload Section -->
<div class="mx-auto max-w-3xl">
	<div class="group relative">
		<div
			class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-40 blur-lg transition duration-300 group-hover:opacity-60"
		></div>
		<div
			class="relative rounded-3xl border border-cyan-300/20 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-2xl"
		>
			<div class="mb-8 text-center">
				<h3 class="mb-2 text-3xl font-bold text-white">Ready to unlock your data's potential?</h3>
				<p class="text-lg text-blue-200/80">Drop your CSV file and watch the magic happen</p>
			</div>

			<label
				for="csv-upload"
				class="group/upload relative flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-400/40 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 transition-all duration-500 hover:scale-[1.02] hover:border-cyan-400/60 hover:bg-cyan-500/10 active:scale-[0.98]"
			>
				<div class="flex flex-col items-center justify-center p-8">
					<div
						class="mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-6 transition-all duration-300 group-hover/upload:scale-110 group-hover/upload:from-cyan-500/30 group-hover/upload:to-blue-500/30"
					>
						<svg
							class="h-16 w-16 text-cyan-400 transition-colors duration-300 group-hover/upload:text-cyan-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
					</div>
					<div class="text-center">
						<p
							class="mb-2 text-2xl font-bold text-white transition-colors group-hover/upload:text-cyan-100"
						>
							Drop your CSV file here
						</p>
						<p class="mb-4 text-lg text-cyan-300">or click to browse your files</p>
						<div class="flex items-center justify-center gap-4 text-sm text-blue-300/80">
							<span class="flex items-center gap-2">
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									></path>
								</svg>
								Supports files up to 50MB
							</span>
							<span class="flex items-center gap-2">
								<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									></path>
								</svg>
								Secure & Private
							</span>
						</div>
					</div>
				</div>

				<input
					id="csv-upload"
					type="file"
					accept=".csv"
					class="hidden"
					bind:this={fileInput}
					onchange={handleFileUpload}
				/>
			</label>

			{#if error}
				<div class="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-sm">
					<div class="flex items-center gap-4">
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/20"
						>
							<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								></path>
							</svg>
						</div>
						<div>
							<p class="font-medium text-red-300">Upload Error</p>
							<p class="text-sm text-red-200/80">{error}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Enhanced Tech Stack -->
	<div class="mt-16 text-center">
		<p class="mb-6 text-lg font-medium text-blue-300/80">Powered by cutting-edge AI technology</p>
		<div class="flex flex-wrap justify-center gap-4">
			<div
				class="group rounded-2xl border border-cyan-300/20 bg-slate-800/50 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-cyan-400/40"
			>
				<span class="mr-3 text-2xl">🦙</span>
				<span class="font-medium text-cyan-300">Llama 3.1 70B</span>
			</div>
			<div
				class="group rounded-2xl border border-emerald-300/20 bg-slate-800/50 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-emerald-400/40"
			>
				<span class="mr-3 text-2xl">✨</span>
				<span class="font-medium text-emerald-300">Gemini Flash</span>
			</div>
			<div
				class="group rounded-2xl border border-orange-300/20 bg-slate-800/50 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-orange-400/40"
			>
				<span class="mr-3 text-2xl">🔗</span>
				<span class="font-medium text-orange-300">LangChain</span>
			</div>
			<div
				class="group rounded-2xl border border-blue-300/20 bg-slate-800/50 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-blue-400/40"
			>
				<span class="mr-3 text-2xl">⚡</span>
				<span class="font-medium text-blue-300">SvelteKit</span>
			</div>
		</div>
	</div>
</div>

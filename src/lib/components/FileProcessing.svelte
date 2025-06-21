<script>
	let {
		uploadedFile,
		isProcessing = $bindable(),
		processCSV,
		resetUpload,
		error = $bindable()
	} = $props();
</script>

<!-- Enhanced File Selected Section -->
<div class="mx-auto max-w-3xl">
	<div class="group relative mb-8">
		<div
			class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 opacity-40 blur-lg transition duration-300 group-hover:opacity-60"
		></div>
		<div
			class="relative rounded-3xl border border-emerald-300/20 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-2xl"
		>
			<div class="text-center">
				<div class="mb-6">
					<div
						class="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-cyan-500/20"
					>
						<svg class="h-10 w-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
								clip-rule="evenodd"
							></path>
						</svg>
					</div>
					<h3 class="mb-3 text-3xl font-bold text-white">File Ready for Analysis</h3>
					<div class="mb-6 rounded-2xl border border-white/10 bg-slate-800/50 p-4">
						<p class="text-lg font-semibold text-emerald-300">{uploadedFile.name}</p>
						<p class="mt-1 text-sm text-blue-200/80">
							{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • CSV Format
						</p>
					</div>
				</div>

				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<button
						onclick={processCSV}
						disabled={isProcessing}
						class="group relative transform rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
					>
						<span class="flex items-center justify-center gap-3">
							{#if isProcessing}
								<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Analyzing with AI...
							{:else}
								<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									></path>
								</svg>
								Analyze with AI
							{/if}
						</span>
					</button>
					<button
						onclick={resetUpload}
						class="rounded-2xl border border-white/20 bg-slate-800/50 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-slate-700/50"
					>
						Choose Different File
					</button>
				</div>
			</div>
		</div>
	</div>

	{#if isProcessing}
		<div class="text-center">
			<div class="group relative">
				<div
					class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 blur transition duration-300 group-hover:opacity-50"
				></div>
				<div
					class="relative inline-flex items-center rounded-2xl border border-cyan-400/20 bg-slate-900/90 px-8 py-6 shadow-2xl backdrop-blur-xl"
				>
					<div class="flex items-center gap-4">
						<div class="relative">
							<div
								class="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400/30 border-t-cyan-400"
							></div>
							<div
								class="animation-delay-150 absolute inset-0 h-8 w-8 animate-spin rounded-full border-4 border-transparent border-t-blue-400"
							></div>
						</div>
						<div class="text-left">
							<p class="text-xl font-bold text-cyan-300">AI Agents Working</p>
							<p class="text-sm text-blue-200/80">Analyzing your data with advanced AI models</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Progress indicators -->
			<div class="mx-auto mt-8 max-w-md">
				<div class="space-y-3">
					<div class="flex items-center gap-3 text-sm">
						<div class="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
						<span class="text-blue-200">Data validation and cleaning</span>
					</div>
					<div class="flex items-center gap-3 text-sm">
						<div class="animation-delay-500 h-2 w-2 animate-pulse rounded-full bg-cyan-400"></div>
						<span class="text-blue-200">Pattern recognition and analysis</span>
					</div>
					<div class="flex items-center gap-3 text-sm">
						<div class="animation-delay-1000 h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
						<span class="text-blue-200">Generating visualizations</span>
					</div>
				</div>
				<p class="mt-6 text-xs text-blue-300/60">This usually takes 10-30 seconds</p>
			</div>
		</div>
	{/if}

	{#if error}
		<div class="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-sm">
			<div class="flex items-center gap-4">
				<div
					class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/20"
				>
					<svg class="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						></path>
					</svg>
				</div>
				<div>
					<p class="font-semibold text-red-300">Analysis Error</p>
					<p class="text-red-200/80">{error}</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Enhanced animation delays for background elements */
	.animation-delay-150 {
		animation-delay: 150ms;
	}

	.animation-delay-500 {
		animation-delay: 500ms;
	}

	.animation-delay-1000 {
		animation-delay: 1s;
	}
</style>

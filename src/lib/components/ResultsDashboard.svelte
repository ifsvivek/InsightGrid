<script>
	import UniversalChart from '$lib/components/UniversalChart.svelte';

	let { insights, chartTemplates, chartConfigs, resetUpload } = $props();
</script>

<!-- Enhanced Results Dashboard -->
<div class="space-y-12">
	<!-- Results Header -->
	<div class="text-center">
		<button
			onclick={resetUpload}
			class="group mb-6 inline-flex items-center gap-2 text-cyan-400 transition-colors duration-300 hover:text-cyan-300"
		>
			<svg
				class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
				fill="currentColor"
				viewBox="0 0 20 20"
			>
				<path
					fill-rule="evenodd"
					d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
					clip-rule="evenodd"
				></path>
			</svg>
			Upload a different file
		</button>

		<div class="mb-8">
			<h2 class="mb-4 text-5xl font-black tracking-tight text-white md:text-6xl">
				Analysis
				<span
					class="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent"
				>
					Complete
				</span>
			</h2>
			<div class="mx-auto max-w-2xl">
				<p class="mb-4 text-xl text-blue-200/80">
					Successfully analyzed your dataset with advanced AI
				</p>
				<div class="flex flex-wrap justify-center gap-6 text-sm">
					<div
						class="flex items-center gap-2 rounded-full border border-cyan-300/20 bg-slate-800/50 px-4 py-2"
					>
						<div class="h-2 w-2 rounded-full bg-cyan-400"></div>
						<span class="font-medium text-cyan-300">{insights.rowCount}</span>
						<span class="text-blue-200">rows</span>
					</div>
					<div
						class="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-slate-800/50 px-4 py-2"
					>
						<div class="h-2 w-2 rounded-full bg-emerald-400"></div>
						<span class="font-medium text-emerald-300">{insights.columnCount}</span>
						<span class="text-blue-200">columns</span>
					</div>
					<div
						class="flex items-center gap-2 rounded-full border border-blue-300/20 bg-slate-800/50 px-4 py-2"
					>
						<div class="h-2 w-2 rounded-full bg-blue-400"></div>
						<span class="font-medium text-blue-300">{insights.fileName}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Enhanced Charts Section -->
	{#if chartTemplates.length > 0}
		<div class="space-y-8">
			<div class="text-center">
				<h3 class="mb-4 text-3xl font-bold text-white md:text-4xl">📊 Generated Visualizations</h3>
				<p class="mx-auto max-w-2xl text-xl text-blue-200/80">
					AI automatically selected and created the most insightful charts for your data
				</p>
			</div>

			<div class="grid gap-8 lg:grid-cols-2">
				{#each chartTemplates as template, index (template.title + index)}
					<div class="group relative">
						<div
							class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-indigo-600/20 opacity-60 blur-lg transition duration-300 group-hover:opacity-80"
						></div>
						<div
							class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl"
						>
							<!-- Chart Header -->
							<div class="border-b border-white/10 p-6">
								<div class="mb-4 flex items-start justify-between">
									<div class="flex-1">
										<h4 class="mb-2 text-xl font-bold text-white">{template.title}</h4>
										<p class="text-sm leading-relaxed text-blue-200/80">
											{template.description}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<div class="rounded-full border border-cyan-400/30 bg-cyan-500/20 px-3 py-1">
										<span class="text-xs font-medium tracking-wide text-cyan-300 uppercase"
											>{template.chartType}</span
										>
									</div>
									<div
										class="rounded-full border border-orange-400/30 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3 py-1"
									>
										<span class="text-xs font-medium text-orange-300"
											>Priority {template.priority}</span
										>
									</div>
								</div>
							</div>

							<!-- Chart Content -->
							<div class="p-6">
								<div class="h-96 w-full">
									{#if chartConfigs[index]}
										{#key `${template.title}-${index}-${template.chartType}`}
											<UniversalChart
												config={chartConfigs[index]}
												title={template.title}
												className="chart-instance"
											/>
										{/key}
									{:else}
										<div
											class="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-cyan-400/30 bg-slate-800/50 backdrop-blur-sm"
										>
											<div class="text-center">
												<div class="relative mx-auto mb-4 h-12 w-12">
													<div
														class="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
													></div>
													<div class="absolute inset-1 rounded-full bg-slate-900"></div>
													<div
														class="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
													></div>
												</div>
												<p class="font-medium text-cyan-300">Generating chart...</p>
												<p class="mt-1 text-sm text-blue-200/60">This may take a moment</p>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center">
			<div class="group relative mx-auto max-w-md">
				<div
					class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 opacity-30 blur"
				></div>
				<div
					class="relative rounded-2xl border border-orange-400/20 bg-slate-900/90 p-8 backdrop-blur-xl"
				>
					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/20"
					>
						<svg class="h-8 w-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							></path>
						</svg>
					</div>
					<h3 class="mb-2 text-xl font-bold text-orange-300">Charts Not Available</h3>
					<p class="text-sm text-orange-200/80">
						Unable to generate visualizations. Templates found: {chartTemplates?.length || 0}
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Enhanced Data Overview -->
	<div class="group relative">
		<div
			class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400/20 via-cyan-500/20 to-blue-600/20 opacity-60 blur-lg"
		></div>
		<div
			class="relative rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl"
		>
			<div class="mb-8 text-center">
				<h3 class="mb-2 text-2xl font-bold text-white">📋 Dataset Overview</h3>
				<p class="text-blue-200/80">Key statistics and structure of your data</p>
			</div>

			<div class="mb-8 grid gap-6 md:grid-cols-3">
				<div class="group relative">
					<div
						class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-30 blur transition duration-300 group-hover:opacity-50"
					></div>
					<div
						class="relative rounded-2xl border border-cyan-300/20 bg-slate-800/80 p-6 text-center"
					>
						<div class="mb-2 text-4xl font-black text-cyan-300">
							{insights.rowCount.toLocaleString()}
						</div>
						<div class="font-medium text-blue-200/80">Total Rows</div>
						<div class="mt-1 text-xs text-blue-300/60">Data Points</div>
					</div>
				</div>
				<div class="group relative">
					<div
						class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-30 blur transition duration-300 group-hover:opacity-50"
					></div>
					<div
						class="relative rounded-2xl border border-emerald-300/20 bg-slate-800/80 p-6 text-center"
					>
						<div class="mb-2 text-4xl font-black text-emerald-300">
							{insights.columnCount}
						</div>
						<div class="font-medium text-blue-200/80">Columns</div>
						<div class="mt-1 text-xs text-blue-300/60">Variables</div>
					</div>
				</div>
				<div class="group relative">
					<div
						class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 opacity-30 blur transition duration-300 group-hover:opacity-50"
					></div>
					<div
						class="relative rounded-2xl border border-blue-300/20 bg-slate-800/80 p-6 text-center"
					>
						<div class="mb-2 text-4xl font-black text-blue-300">{chartTemplates.length}</div>
						<div class="font-medium text-blue-200/80">Charts</div>
						<div class="mt-1 text-xs text-blue-300/60">Generated</div>
					</div>
				</div>
			</div>

			<div class="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
				<h4 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
					<svg class="h-5 w-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
						></path>
					</svg>
					Dataset Columns
				</h4>
				<div class="flex flex-wrap gap-2">
					{#each insights.columns as column, index}
						<div class="group relative">
							<div
								class="rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2 transition-all duration-300 hover:border-cyan-300/30 hover:bg-slate-600/50"
							>
								<span class="text-sm font-medium text-white">{column}</span>
								<span class="ml-2 text-xs text-blue-300/60">#{index + 1}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Enhanced AI Insights -->
	{#if insights.insights?.insightAgent}
		<div class="group relative">
			<div
				class="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-400/20 via-blue-500/20 to-cyan-600/20 opacity-60 blur-lg"
			></div>
			<div
				class="relative rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl"
			>
				<div class="mb-8 text-center">
					<h3 class="mb-2 flex items-center justify-center gap-3 text-2xl font-bold text-white">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-400 to-blue-500"
						>
							🤖
						</div>
						AI-Generated Insights
					</h3>
					<p class="text-blue-200/80">Advanced analysis and patterns discovered in your data</p>
				</div>

				<div class="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
					<div class="prose prose-invert max-w-none">
						{#if insights.insights.insightAgent.insights}
							{@html insights.insights.insightAgent.insights}
						{:else}
							<div class="rounded-xl border border-white/10 bg-slate-900/80 p-6">
								<div class="flex items-center justify-center text-blue-200/80">
									<div class="animate-spin mr-3 h-5 w-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
									Analysis in progress...
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.chart-instance) {
		height: 100%;
		width: 100%;
	}

	:global(.chart-container) {
		height: 100%;
		min-height: 350px;
	}

	:global(.chart-tooltip) {
		z-index: 9999;
	}

	/* Chart container enhanced effects */
	:global(.chart-instance:hover) {
		transform: translateY(-2px);
		transition: transform 0.3s ease;
	}
</style>

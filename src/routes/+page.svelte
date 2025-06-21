<script>
	import { onMount } from 'svelte';
	import UniversalChart from '$lib/components/UniversalChart.svelte';
	import { templateToChartConfig, parseChartTemplates } from '$lib/chartUtils.js';

	let fileInput = $state();
	let uploadedFile = $state(null);
	let isProcessing = $state(false);
	let insights = $state(null);
	let error = $state(null);

	function handleFileUpload(event) {
		const file = event.target.files[0];
		if (file && file.type === 'text/csv') {
			uploadedFile = file;
			error = null;
		} else {
			error = 'Please upload a valid CSV file';
			uploadedFile = null;
		}
	}

	async function processCSV() {
		if (!uploadedFile) return;

		isProcessing = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('file', uploadedFile);

			const response = await fetch('/api/analyze', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to process CSV');
			}

			insights = await response.json();
		} catch (err) {
			error = err.message;
		} finally {
			isProcessing = false;
		}
	}

	function resetUpload() {
		uploadedFile = null;
		insights = null;
		error = null;
		chartTemplates = [];
		if (fileInput) fileInput.value = '';
	}

	// Chart templates state
	let chartTemplates = $state([]);
	let chartConfigs = $state([]);

	function processChartTemplates() {
		if (!insights?.insights?.chartAgent?.templates || !insights?.fullData) return;

		try {
			// Parse chart templates from AI response
			const templates = parseChartTemplates(insights.insights.chartAgent.templates);
			console.log('Parsed templates:', templates.length, templates);
			chartTemplates = templates;

			// Convert templates to chart configs
			const configs = templates.map((template, index) => {
				try {
					const config = templateToChartConfig(template, insights.fullData, insights.columns);
					console.log(`Chart config ${index}:`, template.chartType, 'success');
					return config;
				} catch (error) {
					console.error(`Error creating config for chart ${index}:`, error);
					return null;
				}
			}).filter(config => config !== null);
			
			console.log('Final chart configs:', configs.length);
			chartConfigs = configs;

		} catch (error) {
			console.error('Error processing chart templates:', error);
			chartTemplates = [];
			chartConfigs = [];
		}
	}

	$effect(() => {
		if (insights) {
			processChartTemplates();
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900">
	<!-- Animated background -->
	<div class="fixed inset-0 overflow-hidden">
		<div class="absolute -inset-10 opacity-30">
			<div class="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-cyan-500 blur-3xl"></div>
			<div class="absolute top-3/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-emerald-500 blur-3xl animation-delay-2000"></div>
			<div class="absolute top-1/2 left-1/2 h-96 w-96 animate-pulse rounded-full bg-blue-500 blur-3xl animation-delay-4000"></div>
		</div>
	</div>

	<!-- Header -->
	<header class="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
		<div class="mx-auto max-w-7xl px-4 py-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl shadow-lg">
						🧠
					</div>
					<div>
						<h1 class="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-3xl font-bold text-transparent">
							InsightGrid
						</h1>
						<p class="text-sm text-blue-200">AI-Powered Data Analytics</p>
					</div>
				</div>
				<div class="hidden md:flex items-center gap-6">
					<div class="flex items-center gap-2 text-sm text-blue-200">
						<div class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
						AI Agents Online
					</div>
				</div>
			</div>
		</div>
	</header>

	<main class="relative z-10 mx-auto max-w-7xl px-4 py-12">{#if !uploadedFile && !insights}
		<!-- Hero Section -->
		<div class="text-center mb-12">
			<div class="mb-8">
				<h2 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
					Transform Your
					<span class="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
						Data
					</span>
					<br />Into Insights
				</h2>
				<p class="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
					Upload your CSV and watch our AI agents work together like a complete BI team—
					cleaning data, finding patterns, and creating stunning visualizations automatically.
				</p>
			</div>

			<!-- Feature highlights -->
			<div class="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-300/30 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-cyan-500/20 hover:shadow-xl group">
					<div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">🤖</div>
					<h3 class="text-lg font-semibold text-white mb-2">Multi-Agent AI</h3>
					<p class="text-blue-200 text-sm">Multiple LLM agents collaborate to analyze your data from every angle</p>
				</div>
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-300/30 hover:border-emerald-400/60 transition-all duration-300 hover:shadow-emerald-500/20 hover:shadow-xl group">
					<div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">📊</div>
					<h3 class="text-lg font-semibold text-white mb-2">Smart Visualizations</h3>
					<p class="text-blue-200 text-sm">Automatically suggests and creates the perfect charts for your data</p>
				</div>
				<div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-300/30 hover:border-orange-400/60 transition-all duration-300 hover:shadow-orange-500/20 hover:shadow-xl group">
					<div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
					<h3 class="text-lg font-semibold text-white mb-2">Instant Results</h3>
					<p class="text-blue-200 text-sm">Get comprehensive insights and beautiful dashboards in seconds</p>
				</div>
			</div>
		</div>

		<!-- Upload Section -->
		<div class="max-w-2xl mx-auto">
			<div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-cyan-300/30 shadow-2xl">
				<h3 class="text-2xl font-bold text-white text-center mb-6">
					Ready to unlock your data's potential?
				</h3>
				
				<label
					for="csv-upload"
					class="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/20 hover:scale-105 animate-float"
				>
					<div class="flex flex-col items-center justify-center p-8">
						<div class="mb-4 rounded-full bg-cyan-500/20 p-4 group-hover:bg-cyan-500/30 transition-colors">
							<svg
								class="h-12 w-12 text-cyan-400"
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
						<p class="mb-2 text-xl font-semibold text-white">
							Drop your CSV file here
						</p>
						<p class="text-cyan-300">or click to browse</p>
						<p class="mt-4 text-sm text-blue-300">
							Supports files up to 50MB • Powered by AI
						</p>
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
					<div class="mt-6 rounded-xl bg-red-500/20 border border-red-500/30 p-4">
						<div class="flex items-center gap-3">
							<div class="text-red-400">⚠️</div>
							<p class="text-red-300">{error}</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Tech Stack Preview -->
			<div class="mt-12 text-center">
				<p class="text-blue-300 text-sm mb-4">Powered by cutting-edge AI technology</p>
				<div class="flex flex-wrap justify-center gap-4 text-sm">
					<span class="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-blue-200 border border-cyan-300/30">
						🦙 Llama 3.1 70B
					</span>
					<span class="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-blue-200 border border-emerald-300/30">
						✨ Gemini Flash
					</span>
					<span class="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-blue-200 border border-orange-300/30">
						🔗 LangChain
					</span>
					<span class="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-blue-200 border border-blue-300/30">
						⚡ SvelteKit
					</span>
				</div>
			</div>
		</div>
		{/if}

		{#if uploadedFile && !insights}
			<!-- File Selected Section -->
			<div class="mx-auto max-w-2xl text-center">
				<div class="mb-6 rounded-xl border border-emerald-300/40 bg-emerald-500/10 backdrop-blur-sm p-8">
					<div class="mb-2 text-4xl">📁</div>
					<h3 class="mb-2 text-xl font-semibold text-white">File Ready for Analysis</h3>
					<p class="mb-6 text-blue-200">
						<strong class="text-cyan-300">{uploadedFile.name}</strong> has been uploaded successfully
					</p>
					<div class="flex justify-center gap-4">
						<button
							onclick={processCSV}
							disabled={isProcessing}
							class="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
						>
							{isProcessing ? 'Analyzing...' : 'Analyze with AI'}
						</button>
						<button
							onclick={resetUpload}
							class="rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-white/20"
						>
							Choose Different File
						</button>
					</div>
				</div>

				{#if isProcessing}
					<div class="mt-6 text-center">
						<div class="inline-flex items-center rounded-xl bg-cyan-500/20 border border-cyan-400/40 backdrop-blur-sm px-6 py-4 text-lg font-semibold text-cyan-200 shadow-lg">
							<svg
								class="mr-3 -ml-1 h-6 w-6 animate-spin text-cyan-400"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
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
							AI agents are analyzing your data...
						</div>
						<p class="mt-4 text-sm text-blue-300">This usually takes 10-30 seconds</p>
					</div>
				{/if}

				{#if error}
					<div class="mt-6 rounded-xl bg-red-500/20 border border-red-400/40 p-4">
						<div class="flex items-center gap-3">
							<div class="text-red-400">⚠️</div>
							<p class="text-red-300">{error}</p>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		{#if insights}
			<!-- Results Dashboard -->
			<div class="space-y-8">
				<!-- Results Header -->
				<div class="text-center">
					<button
						onclick={resetUpload}
						class="mb-4 text-sm text-cyan-400 underline hover:text-cyan-300 transition-colors"
					>
						← Upload a different file
					</button>
					<h2 class="mb-2 text-4xl font-bold text-white">Analysis Results</h2>
					<p class="text-blue-200">
						Analyzed <span class="text-cyan-400 font-semibold">{insights.rowCount}</span> rows × <span class="text-cyan-400 font-semibold">{insights.columnCount}</span> columns from
						<strong class="text-white">{insights.fileName}</strong>
					</p>
				</div>

				<!-- Charts Section -->
				{#if chartTemplates.length > 0}
					<div class="space-y-6">
						<h3 class="mb-4 text-2xl font-semibold text-white">📊 Generated Charts</h3>
						<div class="grid gap-6 lg:grid-cols-2">
							{#each chartTemplates as template, index (template.title + index)}
								<div class="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
									<div class="mb-4">
										<h4 class="text-lg font-semibold text-white">{template.title}</h4>
										<p class="text-sm text-blue-200">{template.description}</p>
										<div class="mt-2 flex items-center gap-2">
											<span class="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 text-xs font-medium text-cyan-300">
												{template.chartType}
											</span>
											<span class="rounded-full bg-orange-500/20 border border-orange-400/40 px-3 py-1 text-xs text-orange-300">
												Priority: {template.priority}
											</span>
										</div>
									</div>
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
											<div class="flex h-full items-center justify-center bg-white/10 backdrop-blur-sm rounded-xl border-2 border-dashed border-cyan-400/50">
												<div class="text-center">
													<div class="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"></div>
													<p class="text-cyan-300">Loading chart...</p>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else}
					<div class="rounded-xl border border-orange-400/40 bg-orange-500/20 backdrop-blur-sm p-6 text-center">
						<div class="text-orange-400 text-2xl mb-2">⚠️</div>
						<p class="text-orange-200">
							Charts section not displayed. Templates: {chartTemplates?.length || 0}
						</p>
					</div>
				{/if}

				<!-- Data Overview -->
				<div class="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
					<h3 class="mb-4 text-xl font-semibold text-white">📋 Data Overview</h3>
					<div class="grid gap-4 md:grid-cols-3">
						<div class="rounded-lg bg-cyan-500/20 border border-cyan-400/40 p-4 text-center">
							<div class="text-2xl font-bold text-cyan-300">{insights.rowCount}</div>
							<div class="text-sm text-blue-200">Total Rows</div>
						</div>
						<div class="rounded-lg bg-emerald-500/20 border border-emerald-400/40 p-4 text-center">
							<div class="text-2xl font-bold text-emerald-300">{insights.columnCount}</div>
							<div class="text-sm text-blue-200">Columns</div>
						</div>
						<div class="rounded-lg bg-orange-500/20 border border-orange-400/40 p-4 text-center">
							<div class="text-2xl font-bold text-orange-300">{chartTemplates.length}</div>
							<div class="text-sm text-blue-200">Charts Generated</div>
						</div>
					</div>

					<div class="mt-6">
						<h4 class="mb-2 font-medium text-white">Columns in your dataset:</h4>
						<div class="flex flex-wrap gap-2">
							{#each insights.columns as column}
								<span class="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-sm text-white">
									{column}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<!-- AI Insights -->
				{#if insights.insights?.insightAgent}
					<div class="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-6 shadow-lg">
						<h3 class="mb-4 text-xl font-semibold text-white">🤖 AI Analysis</h3>
						<div class="prose max-w-none text-blue-100">
							<pre class="text-sm whitespace-pre-wrap text-blue-100 bg-black/20 rounded-lg p-4 border border-white/10">{insights.insights.insightAgent.insights ||
									'Analysis in progress...'}</pre>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</main>
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

	/* Animation delays for background elements */
	.animation-delay-2000 {
		animation-delay: 2s;
	}
	
	.animation-delay-4000 {
		animation-delay: 4s;
	}

	/* Smooth hover transitions for buttons */
	button {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Chart container hover effects */
	:global(.chart-instance:hover) {
		transform: translateY(-2px);
		transition: transform 0.3s ease;
	}

	/* Custom scrollbar for better aesthetics */
	::-webkit-scrollbar {
		width: 8px;
	}
	
	::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}
	
	::-webkit-scrollbar-thumb {
		background: rgba(6, 182, 212, 0.5);
		border-radius: 4px;
	}
	
	::-webkit-scrollbar-thumb:hover {
		background: rgba(6, 182, 212, 0.7);
	}

	/* Enhanced backdrop blur for better contrast */
	.backdrop-blur-xl {
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
	}

	/* Gradient text animations */
	@keyframes gradient-shift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-6px);
		}
	}

	.animate-gradient {
		background-size: 200% 200%;
		animation: gradient-shift 3s ease infinite;
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}
</style>

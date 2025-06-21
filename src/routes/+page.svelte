<script>
	import { onMount } from 'svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import FileProcessing from '$lib/components/FileProcessing.svelte';
	import ResultsDashboard from '$lib/components/ResultsDashboard.svelte';
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
			const configs = templates
				.map((template, index) => {
					try {
						const config = templateToChartConfig(template, insights.fullData, insights.columns);
						console.log(`Chart config ${index}:`, template.chartType, 'success');
						return config;
					} catch (error) {
						console.error(`Error creating config for chart ${index}:`, error);
						return null;
					}
				})
				.filter((config) => config !== null);

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

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900"
>
	<!-- Enhanced animated background -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div
			class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-600/20 via-blue-800/10 to-transparent"
		></div>
		<div class="absolute -inset-10 opacity-20">
			<div
				class="absolute top-1/4 left-1/4 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-3xl"
			></div>
			<div
				class="animation-delay-2000 absolute top-3/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 blur-3xl"
			></div>
			<div
				class="animation-delay-4000 absolute top-1/2 left-1/2 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 blur-3xl"
			></div>
		</div>
		<!-- Floating particles -->
		<div class="absolute inset-0">
			<div
				class="animate-float absolute top-1/3 left-1/6 h-2 w-2 rounded-full bg-cyan-400/30"
			></div>
			<div
				class="animate-float animation-delay-1000 absolute top-2/3 left-3/4 h-1 w-1 rounded-full bg-blue-400/40"
			></div>
			<div
				class="animate-float animation-delay-3000 absolute top-1/6 right-1/3 h-3 w-3 rounded-full bg-emerald-400/20"
			></div>
		</div>
	</div>

	<main class="relative z-10 mx-auto max-w-7xl px-6 py-16">
		{#if !uploadedFile && !insights}
			<HeroSection bind:fileInput bind:uploadedFile bind:error {handleFileUpload} />
		{/if}

		{#if uploadedFile && !insights}
			<FileProcessing {uploadedFile} bind:isProcessing {processCSV} {resetUpload} bind:error />
		{/if}

		{#if insights}
			<ResultsDashboard {insights} {chartTemplates} {chartConfigs} {resetUpload} />
		{/if}
	</main>
</div>

<style>
	/* Animation delays for background elements */
	.animation-delay-1000 {
		animation-delay: 1s;
	}

	.animation-delay-2000 {
		animation-delay: 2s;
	}

	.animation-delay-3000 {
		animation-delay: 3s;
	}

	.animation-delay-4000 {
		animation-delay: 4s;
	}

	/* Float animation for background particles */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		33% {
			transform: translateY(-8px) rotate(1deg);
		}
		66% {
			transform: translateY(-4px) rotate(-1deg);
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	/* Accessibility support */
	@media (prefers-reduced-motion: reduce) {
		.animate-pulse,
		.animate-float {
			animation: none;
		}
	}
</style>

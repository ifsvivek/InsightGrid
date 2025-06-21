<script>
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';
	import WordCloudChart from './WordCloudChart.svelte';
	import SankeyChart from './SankeyChart.svelte';
	import TreemapChart from './TreemapChart.svelte';
	import CalendarChart from './CalendarChart.svelte';
	import NetworkChart from './NetworkChart.svelte';
	import SunburstChart from './SunburstChart.svelte';
	import ChordChart from './ChordChart.svelte';
	import AlluvialChart from './AlluvialChart.svelte';
	import ParallelCoordinatesChart from './ParallelCoordinatesChart.svelte';
	import MarimekkoChart from './MarimekkoChart.svelte';
	import BulletChart from './BulletChart.svelte';
	import GanttChart from './GanttChart.svelte';
	import DendrogramChart from './DendrogramChart.svelte';
	import PictogramChart from './PictogramChart.svelte';
	import CandlestickChart from './CandlestickChart.svelte';

	let { config, title = 'Chart', className = '' } = $props();
	let canvasElement = $state();
	let chartInstance = $state();
	let containerElement = $state();
	let isVisible = $state(true); // Start visible by default
	let isIntersecting = $state(true);

	// Generate stable unique ID for canvas to prevent reuse conflicts
	const canvasId = `chart-canvas-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;

	// Intersection Observer for lazy loading
	let intersectionObserver;
	
	onMount(() => {
		console.log('UniversalChart mounted:', { 
			type: config?.type, 
			useCustomComponent, 
			title,
			hasConfig: !!config 
		});
		
		// Set up intersection observer for lazy loading
		if (containerElement && typeof IntersectionObserver !== 'undefined') {
			intersectionObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							console.log('Chart became visible:', config?.type, title);
							isIntersecting = true;
							isVisible = true;
							// Disconnect observer once visible
							intersectionObserver?.disconnect();
						}
					});
				},
				{
					rootMargin: '50px', // Load chart 50px before it comes into view
					threshold: 0.1
				}
			);
			
			intersectionObserver.observe(containerElement);
		} else {
			// Fallback if IntersectionObserver is not supported
			console.log('IntersectionObserver not available, making chart visible immediately:', config?.type);
			isVisible = true;
			isIntersecting = true;
		}
	});

	// Check if we need to use a custom component
	const useCustomComponent = $derived(
		config?.type &&
			[
				'wordcloud',
				'sankey',
				'treemap',
				'calendar',
				'network',
				'sunburst',
				'chord',
				'alluvial',
				'parallel',
				'marimekko',
				'dendogram',
				'bullet',
				'gantt',
				'pictogram',
				'candlestick'
			].includes(config.type)
	);

	onDestroy(() => {
		destroyChart();
		intersectionObserver?.disconnect();
	});
	function destroyChart() {
		if (chartInstance) {
			try {
				// Force Chart.js to clean up properly
				chartInstance.destroy();
			} catch (error) {
				console.warn('Error destroying chart:', error);
			}
			chartInstance = null;
		}
		
		// Additional cleanup - remove any lingering Chart.js instances
		if (canvasElement) {
			const ctx = canvasElement.getContext('2d');
			if (ctx) {
				ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
			}
			
			// Clear Chart.js registry for this canvas
			try {
				// Get any chart instances associated with this canvas
				const existingChart = Chart.getChart(canvasElement);
				if (existingChart) {
					existingChart.destroy();
				}
			} catch (error) {
				console.warn('Error clearing Chart.js registry:', error);
			}
		}
	}

	async function createChart() {
		if (!config || !canvasElement) return;

		// Destroy existing chart before creating new one
		destroyChart();

		// Clear any existing Chart.js instances on this canvas
		const ctx = canvasElement.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		}

		// Ensure no existing Chart.js instance is using this canvas
		try {
			const existingChart = Chart.getChart(canvasElement);
			if (existingChart) {
				existingChart.destroy();
			}
		} catch (error) {
			console.warn('Error checking existing chart:', error);
		}

		let chartConfig = { ...config };

	// Performance optimization: Sample large datasets
	function optimizeDataForPerformance(data) {
		if (!data || !data.datasets) return data;
		
		const MAX_DATA_POINTS = 1000; // Limit data points for performance
		
		// Check if we need to sample the data
		const totalDataPoints = Math.max(
			...data.datasets.map(dataset => Array.isArray(dataset.data) ? dataset.data.length : 0)
		);
		
		if (totalDataPoints <= MAX_DATA_POINTS) {
			return data; // No sampling needed
		}
		
		// Calculate sampling ratio
		const sampleRatio = MAX_DATA_POINTS / totalDataPoints;
		
		// Sample data points
		const optimizedData = {
			...data,
			labels: data.labels ? data.labels.filter((_, index) => 
				index % Math.ceil(1 / sampleRatio) === 0
			) : data.labels,
			datasets: data.datasets.map(dataset => ({
				...dataset,
				data: Array.isArray(dataset.data) 
					? dataset.data.filter((_, index) => index % Math.ceil(1 / sampleRatio) === 0)
					: dataset.data
			}))
		};
		
		return optimizedData;
	}

	// Deep clone and serialize data to completely break Svelte reactivity
	// This ensures Chart.js gets plain JavaScript objects without any Svelte proxies
	function safeCloneChartData(data) {
		// First convert to JSON string to remove all Svelte reactivity
		const jsonString = JSON.stringify(data);
		// Then parse back to get plain objects
		const plainData = JSON.parse(jsonString);

		// Ensure datasets is a plain array with plain objects
		if (plainData.datasets) {
			plainData.datasets = plainData.datasets.map((dataset) => {
				const plainDataset = { ...dataset };
				if (Array.isArray(plainDataset.data)) {
					plainDataset.data = [...plainDataset.data];
				}
				return plainDataset;
			});
		}

		// Ensure labels is a plain array
		if (plainData.labels && Array.isArray(plainData.labels)) {
			plainData.labels = [...plainData.labels];
		}

		// Apply performance optimization
		return optimizeDataForPerformance(plainData);
	}

		try {
			chartConfig.data = safeCloneChartData(config.data);
		} catch (error) {
			console.warn('Error cloning chart data:', error);
			// Ultra-safe fallback
			chartConfig.data = {
				labels: [],
				datasets: []
			};
			return;
		}

		// Handle special chart type configurations
		switch (config.type) {
			case 'area':
				chartConfig.type = 'line';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					fill: true,
					tension: 0.4
				}));
				break;

			case 'area-spline':
				chartConfig.type = 'line';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					fill: true,
					tension: 0.6,
					cubicInterpolationMode: 'monotone'
				}));
				break;

			case 'horizontalBar':
				chartConfig.type = 'bar';
				chartConfig.options = {
					...chartConfig.options,
					indexAxis: 'y'
				};
				break;

			case 'histogram':
				chartConfig.type = 'bar';
				chartConfig.options = {
					...chartConfig.options,
					scales: {
						...chartConfig.options?.scales,
						x: {
							...chartConfig.options?.scales?.x,
							categoryPercentage: 1.0,
							barPercentage: 1.0
						}
					}
				};
				break;

			case 'step':
				chartConfig.type = 'line';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					stepped: 'before',
					tension: 0
				}));
				break;

			case 'mixed':
				chartConfig.type = 'bar'; // Base type, datasets will override
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					type: dataset.type || 'bar'
				}));
				break;

			case 'lollipop':
				chartConfig.type = 'bar'; // Will be handled with multiple datasets
				break;

			case 'dot-plot':
				chartConfig.type = 'scatter';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					showLine: false,
					pointRadius: 6
				}));
				break;

			case 'boxplot':
				// Box plots using bar chart with custom rendering
				chartConfig.type = 'bar';
				chartConfig.options = {
					...chartConfig.options,
					plugins: {
						...chartConfig.options?.plugins,
						tooltip: {
							...chartConfig.options?.plugins?.tooltip,
							callbacks: {
								label: function (context) {
									const stats = context.raw;
									if (typeof stats === 'object' && stats.min !== undefined) {
										return [
											`Min: ${stats.min}`,
											`Q1: ${stats.q1}`,
											`Median: ${stats.median}`,
											`Q3: ${stats.q3}`,
											`Max: ${stats.max}`
										];
									}
									return context.formattedValue;
								}
							}
						}
					}
				};
				break;

			case 'waterfall':
				chartConfig.type = 'bar';
				chartConfig.options = {
					...chartConfig.options,
					scales: {
						...chartConfig.options?.scales,
						y: {
							...chartConfig.options?.scales?.y,
							stacked: true
						}
					}
				};
				break;

			case 'funnel':
				chartConfig.type = 'bar';
				chartConfig.options = {
					...chartConfig.options,
					indexAxis: 'y'
				};
				break;

			case 'gauge':
				chartConfig.type = 'doughnut';
				chartConfig.options = {
					...chartConfig.options,
					circumference: 180,
					rotation: 270,
					cutout: '70%'
				};
				break;

			case 'radialBar':
			case 'radial-column':
				chartConfig.type = 'polarArea';
				break;

			case 'spider':
				chartConfig.type = 'radar';
				break;

			case 'streamgraph':
				chartConfig.type = 'line';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					fill: true,
					tension: 0.4
				}));
				chartConfig.options = {
					...chartConfig.options,
					scales: {
						...chartConfig.options?.scales,
						y: {
							...chartConfig.options?.scales?.y,
							stacked: true
						}
					}
				};
				break;

			case 'slope':
			case 'bump':
				chartConfig.type = 'line';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					tension: 0,
					pointRadius: 6
				}));
				break;

			case 'heatmap':
				// Render as scatter plot with custom point sizes
				chartConfig.type = 'scatter';
				chartConfig.options = {
					...chartConfig.options,
					scales: {
						...chartConfig.options?.scales,
						x: {
							...chartConfig.options?.scales?.x,
							type: 'linear'
						},
						y: {
							...chartConfig.options?.scales?.y,
							type: 'linear'
						}
					}
				};
				break;

			case 'violin':
			case 'ridgeline':
				// Render as area chart for now
				chartConfig.type = 'line';
				chartConfig.data.datasets = chartConfig.data.datasets.map((dataset) => ({
					...dataset,
					fill: true,
					tension: 0.4
				}));
				break;

			case 'treemap':
			case 'sunburst':
			case 'sankey':
			case 'network':
			case 'chord':
			case 'alluvial':
			case 'parallel':
			case 'marimekko':
			case 'calendar':
			case 'wordcloud':
			case 'dendogram':
			case 'bullet':
			case 'gantt':
			case 'pictogram':
			case 'candlestick':
				// These require custom implementations or external libraries
				// For now, render a placeholder or fallback to bar chart
				console.warn(`Chart type '${config.type}' requires custom implementation`);
				chartConfig.type = 'bar';
				chartConfig.options = {
					...chartConfig.options,
					plugins: {
						...chartConfig.options?.plugins,
						title: {
							...chartConfig.options?.plugins?.title,
							text: `${chartConfig.options?.plugins?.title?.text || 'Chart'} (${config.type} - Custom Implementation Required)`
						}
					}
				};
				break;

			default:
				// Keep the original type for standard charts
				break;
		}

		try {
			// Add a small delay to ensure canvas is ready
			await new Promise((resolve) => setTimeout(resolve, 10));
			console.log('Creating chart with config:', config?.type, 'on canvas:', canvasId);
			chartInstance = new Chart(canvasElement, chartConfig);
			console.log('Chart created successfully:', chartInstance.id);
		} catch (error) {
			console.error('Error creating chart:', error);
			// Don't retry, just fail gracefully to avoid infinite loops
			chartInstance = null;
		}
	}

	// Track config changes to avoid infinite loops
	let lastConfigStr = $state('');
	let isCreating = $state(false);
	let isInitialized = $state(false);

	$effect(() => {
		// Only create chart when visible and component is ready
		if (!config || !canvasElement || useCustomComponent || isCreating || !isVisible) return;

		// Create a stable config signature to prevent unnecessary recreations
		const configStr = JSON.stringify({
			type: config.type,
			dataLength: config.data?.datasets?.[0]?.data?.length || 0,
			labelsLength: config.data?.labels?.length || 0
		});
		
		if (configStr === lastConfigStr && isInitialized) return;

		lastConfigStr = configStr;
		isInitialized = true;

		if (chartInstance) {
			// Update existing chart data without recreating
			try {
				// Use the same safe cloning function for updates
				const newData = (() => {
					const jsonString = JSON.stringify(config.data);
					const plainData = JSON.parse(jsonString);

					if (plainData.datasets) {
						plainData.datasets = plainData.datasets.map((dataset) => {
							const plainDataset = { ...dataset };
							if (Array.isArray(plainDataset.data)) {
								plainDataset.data = [...plainDataset.data];
							}
							return plainDataset;
						});
					}

					if (plainData.labels && Array.isArray(plainData.labels)) {
						plainData.labels = [...plainData.labels];
					}

					return optimizeDataForPerformance(plainData);
				})();

				chartInstance.data = newData;
				if (config.options) {
					Object.assign(chartInstance.options, config.options);
				}
				chartInstance.update('none');
			} catch (error) {
				console.warn('Error updating chart, recreating:', error);
				isCreating = true;
				createChart().finally(() => {
					isCreating = false;
				});
			}
		} else {
			isCreating = true;
			createChart().finally(() => {
				isCreating = false;
			});
		}
	});
</script>

<div class={`chart-container ${className}`} bind:this={containerElement}>
	{#if !isVisible}
		<div class="chart-loading">
			<div class="loading-placeholder">
				<div class="loading-spinner"></div>
				<p>Loading {title}...</p>
			</div>
		</div>
	{:else if useCustomComponent}
		{#if config.type === 'wordcloud'}
			<WordCloudChart {config} {title} {className} />
		{:else if config.type === 'sankey'}
			<SankeyChart {config} {title} {className} />
		{:else if config.type === 'treemap'}
			<TreemapChart {config} {title} {className} />
		{:else if config.type === 'calendar'}
			<CalendarChart {config} {title} {className} />
		{:else if config.type === 'network'}
			<NetworkChart {config} {title} {className} />
		{:else if config.type === 'sunburst'}
			<SunburstChart {config} {title} {className} />
		{:else if config.type === 'chord'}
			<ChordChart {config} {title} {className} />
		{:else if config.type === 'alluvial'}
			<AlluvialChart {config} {title} {className} />
		{:else if config.type === 'parallel'}
			<ParallelCoordinatesChart {config} {title} {className} />
		{:else if config.type === 'marimekko'}
			<MarimekkoChart {config} {title} {className} />
		{:else if config.type === 'bullet'}
			<BulletChart {config} {title} {className} />
		{:else if config.type === 'gantt'}
			<GanttChart {config} {title} {className} />
		{:else if config.type === 'dendogram'}
			<DendrogramChart {config} {title} {className} />
		{:else if config.type === 'pictogram'}
			<PictogramChart {config} {title} {className} />
		{:else if config.type === 'candlestick'}
			<CandlestickChart {config} {title} {className} />
		{:else}
			<div class="custom-chart-placeholder">
				<p>Custom chart type "{config.type}" not yet implemented</p>
			</div>
		{/if}
	{:else}
		<canvas bind:this={canvasElement} id={canvasId} aria-label={title}></canvas>
	{/if}
</div>

<style>
	.chart-container {
		position: relative;
		height: 400px;
		width: 100%;
	}

	.chart-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 8px;
	}

	.loading-placeholder {
		text-align: center;
		color: #6c757d;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e9ecef;
		border-top: 4px solid #007bff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 12px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-placeholder p {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
	}

	.custom-chart-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		background: #f5f5f5;
		border: 2px dashed #ccc;
		border-radius: 8px;
	}

	.custom-chart-placeholder p {
		color: #666;
		font-style: italic;
		margin: 0;
	}

	:global(.chart-tooltip) {
		position: absolute;
		background: rgba(0, 0, 0, 0.9);
		color: white;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 12px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		pointer-events: none;
		z-index: 1000;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		max-width: 300px;
	}
</style>

<script>
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	export let template;
	export let data;
	export let columns;

	let canvas;
	let chart;

	onMount(() => {
		if (canvas && template && data) {
			createChart();
		}
	});

	function createChart() {
		try {
			// Process data for bar chart
			const processedData = processBarData(template, data);

			const config = {
				type: 'bar',
				data: processedData,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						title: {
							display: true,
							text: template.title,
							font: { size: 16, weight: 'bold' }
						},
						legend: {
							display: true,
							position: 'top'
						}
					},
					scales: {
						x: {
							title: {
								display: true,
								text: template.xAxis
							}
						},
						y: {
							title: {
								display: true,
								text: template.yAxis
							}
						}
					}
				}
			};

			chart = new Chart(canvas, config);
		} catch (error) {
			console.error('Error creating bar chart:', error);
		}
	}

	function processBarData(template, fullData) {
		const { xAxis, yAxis, aggregation, colorScheme } = template;

		// Group and aggregate data
		const grouped = {};
		fullData.forEach((row) => {
			const xValue = row[xAxis];
			const yValue = parseFloat(row[yAxis]) || 0;

			if (xValue) {
				if (!grouped[xValue]) {
					grouped[xValue] = [];
				}
				grouped[xValue].push(yValue);
			}
		});

		// Aggregate values
		const labels = Object.keys(grouped).sort();
		const values = labels.map((label) => {
			const values = grouped[label];
			switch (aggregation) {
				case 'sum':
					return values.reduce((a, b) => a + b, 0);
				case 'avg':
					return values.reduce((a, b) => a + b, 0) / values.length;
				case 'count':
					return values.length;
				default:
					return values[0];
			}
		});

		return {
			labels,
			datasets: [
				{
					label: yAxis,
					data: values,
					backgroundColor: getColors(colorScheme, labels.length),
					borderColor: getColors(colorScheme, labels.length),
					borderWidth: 1
				}
			]
		};
	}

	function getColors(scheme, count) {
		const colorSchemes = {
			blue: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#312E81'],
			green: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
			red: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
			purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
			rainbow: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16']
		};

		const colors = colorSchemes[scheme] || colorSchemes.blue;
		return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
	}

	function destroy() {
		if (chart) {
			chart.destroy();
		}
	}
</script>

<div class="h-80 w-full">
	<canvas bind:this={canvas}></canvas>
</div>

<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Bullet Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.data) {
			createBulletChart();
		}
	});

	function createBulletChart() {
		// Handle different data formats
		const data = Array.isArray(config.data) ? config.data : config.data.data || [];
		
		if (!Array.isArray(data) || data.length === 0) {
			console.warn('BulletChart: No valid data provided');
			return;
		}

		const width = 600;
		const height = Math.max(200, data.length * 60);
		const margin = { top: 20, right: 100, bottom: 20, left: 150 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;
		const barHeight = Math.min(40, innerHeight / data.length - 10);

		// Scale for values - ensure we have valid numbers
		const ranges = data.map(d => Number(d.range) || 0).filter(d => d > 0);
		const maxRange = ranges.length > 0 ? d3.max(ranges) : 100;
		
		const xScale = d3.scaleLinear()
			.domain([0, maxRange])
			.range([0, innerWidth]);

		// Create bullet chart for each item
		data.forEach((d, i) => {
			const yPos = i * (barHeight + 10);

			// Background range bar
			g.append('rect')
				.attr('x', 0)
				.attr('y', yPos)
				.attr('width', xScale(d.range))
				.attr('height', barHeight)
				.style('fill', '#f0f0f0')
				.style('stroke', '#ccc')
				.style('stroke-width', 1);

			// Performance ranges (if available)
			if (d.ranges && Array.isArray(d.ranges)) {
				d.ranges.forEach((range, rangeIndex) => {
					const rangeColors = ['#eee', '#ddd', '#ccc'];
					g.append('rect')
						.attr('x', 0)
						.attr('y', yPos + 5)
						.attr('width', xScale(range))
						.attr('height', barHeight - 10)
						.style('fill', rangeColors[rangeIndex] || '#ddd');
				});
			}

			// Value bar
			g.append('rect')
				.attr('x', 0)
				.attr('y', yPos + barHeight * 0.3)
				.attr('width', xScale(d.value))
				.attr('height', barHeight * 0.4)
				.style('fill', d.color || '#4CAF50')
				.style('opacity', 0.8);

			// Target marker
			if (d.target) {
				g.append('line')
					.attr('x1', xScale(d.target))
					.attr('x2', xScale(d.target))
					.attr('y1', yPos)
					.attr('y2', yPos + barHeight)
					.style('stroke', '#333')
					.style('stroke-width', 3);

				// Target label
				g.append('text')
					.attr('x', xScale(d.target))
					.attr('y', yPos - 5)
					.style('text-anchor', 'middle')
					.style('font-size', '10px')
					.style('fill', '#333')
					.text('Target');
			}

			// Label
			g.append('text')
				.attr('x', -10)
				.attr('y', yPos + barHeight / 2)
				.style('text-anchor', 'end')
				.style('font-size', '12px')
				.style('fill', '#333')
				.attr('dy', '0.35em')
				.text(d.label);

			// Value label
			g.append('text')
				.attr('x', innerWidth + 10)
				.attr('y', yPos + barHeight / 2)
				.style('text-anchor', 'start')
				.style('font-size', '12px')
				.style('fill', '#333')
				.attr('dy', '0.35em')
				.text(`${d.value}${d.target ? ` / ${d.target}` : ''}`);

			// Add hover effects
			const hoverGroup = g.append('rect')
				.attr('x', 0)
				.attr('y', yPos)
				.attr('width', innerWidth)
				.attr('height', barHeight)
				.style('fill', 'transparent')
				.style('cursor', 'pointer')
				.on('mouseover', function(event) {
					// Highlight the value bar
					g.selectAll('rect')
						.filter((_, index) => index === i + data.length + 1)
						.style('opacity', 1);

					// Show tooltip
					const tooltip = d3.select('body').append('div')
						.attr('class', 'chart-tooltip')
						.style('position', 'absolute')
						.style('background', 'rgba(0, 0, 0, 0.8)')
						.style('color', 'white')
						.style('padding', '8px')
						.style('border-radius', '4px')
						.style('font-size', '12px')
						.style('pointer-events', 'none')
						.style('z-index', 1000);

					const performance = d.target ? ((d.value / d.target) * 100).toFixed(1) + '%' : 'N/A';

					tooltip.html(`
						<strong>${d.label}</strong><br/>
						Value: ${d.value}<br/>
						Target: ${d.target || 'N/A'}<br/>
						Range: ${d.range}<br/>
						Performance: ${performance}
					`)
					.style('left', (event.pageX + 10) + 'px')
					.style('top', (event.pageY - 10) + 'px');
				})
				.on('mouseout', function() {
					// Reset opacity
					g.selectAll('rect')
						.filter((_, index) => index === i + data.length + 1)
						.style('opacity', 0.8);

					d3.selectAll('.chart-tooltip').remove();
				});
		});

		// Add scale at the bottom
		const xAxis = d3.axisBottom(xScale)
			.ticks(5)
			.tickFormat(d3.format('.0f'));

		g.append('g')
			.attr('transform', `translate(0, ${innerHeight})`)
			.call(xAxis);
	}

	$effect(() => {
		if (svgElement && config?.data) {
			createBulletChart();
		}
	});
</script>

<div class={`bullet-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
</div>

<style>
	.bullet-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		min-height: 250px;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
	}

	svg {
		max-width: 100%;
		max-height: 100%;
	}

	:global(.chart-tooltip) {
		position: absolute;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 8px;
		border-radius: 4px;
		font-size: 12px;
		pointer-events: none;
		z-index: 1000;
	}
</style>

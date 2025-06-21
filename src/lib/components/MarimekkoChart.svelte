<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Marimekko Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.data && config?.labels) {
			createMarimekkoChart();
		}
	});

	function createMarimekkoChart() {
		const { data, labels } = config;
		const width = 600;
		const height = 400;
		const margin = { top: 50, right: 50, bottom: 50, left: 50 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Color scale
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		// Calculate cumulative positions
		let currentX = 0;
		let currentY = 0;

		// Group data by Y axis for stacking
		const yGroups = {};
		data.forEach(d => {
			if (!yGroups[d.yLabel]) {
				yGroups[d.yLabel] = [];
			}
			yGroups[d.yLabel].push(d);
		});

		// Sort Y groups by total height
		const sortedYGroups = Object.entries(yGroups).sort((a, b) => {
			const aHeight = a[1].reduce((sum, d) => sum + d.height, 0);
			const bHeight = b[1].reduce((sum, d) => sum + d.height, 0);
			return bHeight - aHeight;
		});

		// Calculate positions for rectangles
		const rectangles = [];
		currentY = 0;

		sortedYGroups.forEach(([yLabel, groupData]) => {
			const groupHeight = groupData[0].height; // All items in group have same height
			const scaledHeight = (groupHeight / 100) * innerHeight;
			
			currentX = 0;
			groupData.forEach(d => {
				const scaledWidth = (d.width / 100) * innerWidth;
				
				rectangles.push({
					...d,
					x: currentX,
					y: currentY,
					width: scaledWidth,
					height: scaledHeight
				});
				
				currentX += scaledWidth;
			});
			
			currentY += scaledHeight;
		});

		// Draw rectangles
		g.selectAll('.marimekko-rect')
			.data(rectangles)
			.enter().append('rect')
			.attr('class', 'marimekko-rect')
			.attr('x', d => d.x)
			.attr('y', d => d.y)
			.attr('width', d => d.width)
			.attr('height', d => d.height)
			.style('fill', d => d.color || color(d.xLabel))
			.style('stroke', '#fff')
			.style('stroke-width', 1)
			.style('opacity', 0.8)
			.on('mouseover', function(event, d) {
				d3.select(this).style('opacity', 1);
				
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

				tooltip.html(`
					<strong>${d.xLabel} × ${d.yLabel}</strong><br/>
					Value: ${d.value}<br/>
					Width: ${d.width.toFixed(1)}%<br/>
					Height: ${d.height.toFixed(1)}%
				`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this).style('opacity', 0.8);
				d3.selectAll('.chart-tooltip').remove();
			});

		// Add X axis labels
		const xLabelData = {};
		rectangles.forEach(d => {
			if (!xLabelData[d.xLabel]) {
				xLabelData[d.xLabel] = {
					label: d.xLabel,
					x: d.x,
					width: d.width
				};
			} else {
				xLabelData[d.xLabel].width += d.width;
			}
		});

		g.selectAll('.x-label')
			.data(Object.values(xLabelData))
			.enter().append('text')
			.attr('class', 'x-label')
			.attr('x', d => d.x + d.width / 2)
			.attr('y', innerHeight + 20)
			.style('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#333')
			.text(d => d.label);

		// Add Y axis labels
		const yLabelData = {};
		rectangles.forEach(d => {
			if (!yLabelData[d.yLabel]) {
				yLabelData[d.yLabel] = {
					label: d.yLabel,
					y: d.y,
					height: d.height
				};
			}
		});

		g.selectAll('.y-label')
			.data(Object.values(yLabelData))
			.enter().append('text')
			.attr('class', 'y-label')
			.attr('x', -10)
			.attr('y', d => d.y + d.height / 2)
			.style('text-anchor', 'end')
			.style('font-size', '12px')
			.style('fill', '#333')
			.attr('dy', '0.35em')
			.text(d => d.label);

		// Add percentage labels on rectangles (for larger ones)
		g.selectAll('.value-label')
			.data(rectangles.filter(d => d.width > 30 && d.height > 20))
			.enter().append('text')
			.attr('class', 'value-label')
			.attr('x', d => d.x + d.width / 2)
			.attr('y', d => d.y + d.height / 2)
			.style('text-anchor', 'middle')
			.style('font-size', '10px')
			.style('fill', '#fff')
			.style('font-weight', 'bold')
			.attr('dy', '0.35em')
			.text(d => d.value);

		// Add grid lines for better readability
		const xPositions = [...new Set(rectangles.map(d => d.x))].sort((a, b) => a - b);
		const yPositions = [...new Set(rectangles.map(d => d.y))].sort((a, b) => a - b);

		g.selectAll('.grid-x')
			.data(xPositions.slice(1))
			.enter().append('line')
			.attr('class', 'grid-x')
			.attr('x1', d => d)
			.attr('x2', d => d)
			.attr('y1', 0)
			.attr('y2', innerHeight)
			.style('stroke', '#ccc')
			.style('stroke-width', 1)
			.style('stroke-dasharray', '2,2');

		g.selectAll('.grid-y')
			.data(yPositions.slice(1))
			.enter().append('line')
			.attr('class', 'grid-y')
			.attr('x1', 0)
			.attr('x2', innerWidth)
			.attr('y1', d => d)
			.attr('y2', d => d)
			.style('stroke', '#ccc')
			.style('stroke-width', 1)
			.style('stroke-dasharray', '2,2');
	}

	$effect(() => {
		if (svgElement && config?.data && config?.labels) {
			createMarimekkoChart();
		}
	});
</script>

<div class={`marimekko-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
</div>

<style>
	.marimekko-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 450px;
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

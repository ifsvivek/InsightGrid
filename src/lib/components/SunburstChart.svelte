<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Sunburst Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.data?.datasets?.[0]?.data) {
			createSunburstChart();
		}
	});

	function createSunburstChart() {
		const data = config.data.datasets[0].data;
		const width = 400;
		const height = 400;
		const radius = Math.min(width, height) / 2;

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${width / 2},${height / 2})`);

		// Create hierarchy structure
		const hierarchy = {
			name: 'root',
			children: []
		};

		// Group data by level
		const levelData = {};
		data.forEach(item => {
			const level = item.level || 0;
			if (!levelData[level]) levelData[level] = [];
			levelData[level].push(item);
		});

		// Build hierarchy for levels 0 and 1
		levelData[0]?.forEach(parentItem => {
			const children = levelData[1]?.filter(child => child.parent === parentItem.label) || [];
			hierarchy.children.push({
				name: parentItem.label,
				value: parentItem.value,
				color: parentItem.color,
				children: children.map(child => ({
					name: child.label,
					value: child.value,
					color: child.color
				}))
			});
		});

		// Create partition layout
		const partition = d3.partition()
			.size([2 * Math.PI, radius]);

		const root = d3.hierarchy(hierarchy)
			.sum(d => d.value)
			.sort((a, b) => b.value - a.value);

		partition(root);

		// Create arc generator
		const arc = d3.arc()
			.startAngle(d => d.x0)
			.endAngle(d => d.x1)
			.innerRadius(d => d.y0)
			.outerRadius(d => d.y1);

		// Create color scale
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		// Create paths
		const path = g.selectAll('path')
			.data(root.descendants().filter(d => d.depth))
			.enter().append('path')
			.attr('d', arc)
			.style('fill', d => d.data.color || color(d.data.name))
			.style('stroke', '#fff')
			.style('stroke-width', 2)
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
					<strong>${d.data.name}</strong><br/>
					Value: ${d.value}<br/>
					Percentage: ${((d.value / root.value) * 100).toFixed(1)}%
				`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this).style('opacity', 0.8);
				d3.selectAll('.chart-tooltip').remove();
			});

		// Add labels for larger segments
		const text = g.selectAll('text')
			.data(root.descendants().filter(d => d.depth && (d.x1 - d.x0) > 0.1))
			.enter().append('text')
			.attr('transform', d => {
				const angle = (d.x0 + d.x1) / 2;
				const radius = (d.y0 + d.y1) / 2;
				return `rotate(${angle * 180 / Math.PI - 90}) translate(${radius},0) rotate(${angle > Math.PI ? 180 : 0})`;
			})
			.attr('dy', '0.35em')
			.style('text-anchor', d => (d.x0 + d.x1) / 2 > Math.PI ? 'end' : 'start')
			.style('font-size', '10px')
			.style('fill', 'white')
			.text(d => d.data.name.length > 8 ? d.data.name.substring(0, 8) + '...' : d.data.name);
	}

	$effect(() => {
		if (svgElement && config?.data?.datasets?.[0]?.data) {
			createSunburstChart();
		}
	});
</script>

<div class={`sunburst-container ${className}`} bind:this={containerElement}>
	{#if config?.options?.plugins?.title?.text}
		<h3 class="chart-title">{config.options.plugins.title.text}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
</div>

<style>
	.sunburst-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 400px;
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

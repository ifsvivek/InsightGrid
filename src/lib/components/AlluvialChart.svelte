<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Alluvial Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.nodes && config?.links) {
			createAlluvialChart();
		}
	});

	function createAlluvialChart() {
		const { nodes, links } = config;
		const width = 600;
		const height = 400;
		const margin = { top: 20, right: 20, bottom: 20, left: 20 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Group nodes by stage
		const stages = {};
		nodes.forEach(node => {
			if (!stages[node.stage]) stages[node.stage] = [];
			stages[node.stage].push(node);
		});

		const stageCount = Object.keys(stages).length;
		const stageWidth = (width - margin.left - margin.right) / (stageCount - 1);

		// Position nodes
		Object.keys(stages).forEach((stage, stageIndex) => {
			const stageNodes = stages[stage];
			const x = stageIndex * stageWidth;
			
			stageNodes.forEach((node, nodeIndex) => {
				node.x = x;
				node.y = (height - margin.top - margin.bottom) * (nodeIndex + 1) / (stageNodes.length + 1);
			});
		});

		// Create node lookup
		const nodeMap = {};
		nodes.forEach(node => {
			nodeMap[node.id] = node;
		});

		// Create paths for links
		const linkPath = d3.linkHorizontal()
			.x(d => d.x)
			.y(d => d.y);

		// Draw links
		g.selectAll('.link')
			.data(links)
			.enter().append('path')
			.attr('class', 'link')
			.attr('d', d => {
				const source = nodeMap[d.source];
				const target = nodeMap[d.target];
				return linkPath({ source, target });
			})
			.style('fill', 'none')
			.style('stroke', d => nodeMap[d.source].color || '#69b3a2')
			.style('stroke-width', d => Math.max(2, Math.sqrt(d.value) * 2))
			.style('opacity', 0.6)
			.on('mouseover', function(event, d) {
				d3.select(this).style('opacity', 0.9);
				
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
					<strong>${nodeMap[d.source].label} → ${nodeMap[d.target].label}</strong><br/>
					Flow: ${d.value}
				`)
				.style('left', (event.pageX + 10) + 'px')
				.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function() {
				d3.select(this).style('opacity', 0.6);
				d3.selectAll('.chart-tooltip').remove();
			});

		// Draw nodes
		g.selectAll('.node')
			.data(nodes)
			.enter().append('circle')
			.attr('class', 'node')
			.attr('cx', d => d.x)
			.attr('cy', d => d.y)
			.attr('r', 8)
			.style('fill', d => d.color || '#69b3a2')
			.style('stroke', '#fff')
			.style('stroke-width', 2)
			.on('mouseover', function(event, d) {
				d3.select(this).style('r', 10);
				
				// Highlight connected links
				g.selectAll('.link')
					.style('opacity', link => 
						link.source === d.id || link.target === d.id ? 0.9 : 0.2
					);
			})
			.on('mouseout', function() {
				d3.select(this).style('r', 8);
				g.selectAll('.link').style('opacity', 0.6);
			});

		// Add node labels
		g.selectAll('.node-label')
			.data(nodes)
			.enter().append('text')
			.attr('class', 'node-label')
			.attr('x', d => d.x)
			.attr('y', d => d.y - 12)
			.style('text-anchor', 'middle')
			.style('font-size', '10px')
			.style('fill', '#333')
			.text(d => d.label);

		// Add stage labels
		Object.keys(stages).forEach((stage, stageIndex) => {
			g.append('text')
				.attr('x', stageIndex * stageWidth)
				.attr('y', -5)
				.style('text-anchor', 'middle')
				.style('font-size', '12px')
				.style('font-weight', 'bold')
				.style('fill', '#666')
				.text(`Stage ${parseInt(stage) + 1}`);
		});
	}

	$effect(() => {
		if (svgElement && config?.nodes && config?.links) {
			createAlluvialChart();
		}
	});
</script>

<div class={`alluvial-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
</div>

<style>
	.alluvial-container {
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

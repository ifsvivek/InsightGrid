<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	let { config, title = 'Dendrogram Chart', className = '' } = $props();
	let svgElement;
	let containerElement;

	onMount(() => {
		if (svgElement && config?.nodes && config?.distances) {
			createDendrogramChart();
		}
	});

	function createDendrogramChart() {
		const { nodes, distances } = config;
		const width = 600;
		const height = 400;
		const margin = { top: 20, right: 90, bottom: 20, left: 90 };

		// Clear previous chart
		d3.select(svgElement).selectAll('*').remove();

		const svg = d3.select(svgElement)
			.attr('width', width)
			.attr('height', height);

		const g = svg.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		// Simple hierarchical clustering simulation
		// In a real implementation, you'd use proper clustering algorithms
		const clusterData = performSimpleClustering(nodes, distances);

		// Create tree layout
		const tree = d3.tree()
			.size([innerHeight, innerWidth]);

		const root = d3.hierarchy(clusterData);
		tree(root);

		// Add links
		g.selectAll('.link')
			.data(root.descendants().slice(1))
			.enter().append('path')
			.attr('class', 'link')
			.attr('d', d => {
				return `M${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`;
			})
			.style('fill', 'none')
			.style('stroke', '#999')
			.style('stroke-width', 2);

		// Add nodes
		const node = g.selectAll('.node')
			.data(root.descendants())
			.enter().append('g')
			.attr('class', 'node')
			.attr('transform', d => `translate(${d.y},${d.x})`);

		node.append('circle')
			.attr('r', d => d.children ? 4 : 6)
			.style('fill', d => d.data.color || (d.children ? '#999' : '#69b3a2'))
			.style('stroke', '#fff')
			.style('stroke-width', 2)
			.on('mouseover', function(event, d) {
				d3.select(this).attr('r', d.children ? 6 : 8);

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

				const content = d.children ? 
					`<strong>Cluster Node</strong><br/>Height: ${d.data.height?.toFixed(2) || 'N/A'}<br/>Children: ${d.children.length}` :
					`<strong>${d.data.label}</strong><br/>Leaf Node`;

				tooltip.html(content)
					.style('left', (event.pageX + 10) + 'px')
					.style('top', (event.pageY - 10) + 'px');
			})
			.on('mouseout', function(event, d) {
				d3.select(this).attr('r', d.children ? 4 : 6);
				d3.selectAll('.chart-tooltip').remove();
			});

		// Add labels for leaf nodes
		node.filter(d => !d.children)
			.append('text')
			.attr('dy', 3)
			.attr('x', d => 10)
			.style('text-anchor', 'start')
			.style('font-size', '11px')
			.style('fill', '#333')
			.text(d => d.data.label);

		// Add distance scale
		const maxDistance = d3.max(root.descendants(), d => d.data.height || 0);
		const distanceScale = d3.scaleLinear()
			.domain([0, maxDistance])
			.range([0, innerWidth]);

		// Add distance axis
		const distanceAxis = d3.axisBottom(distanceScale)
			.ticks(5)
			.tickFormat(d3.format('.2f'));

		g.append('g')
			.attr('class', 'distance-axis')
			.attr('transform', `translate(0, ${innerHeight + 10})`)
			.call(distanceAxis);

		g.append('text')
			.attr('x', innerWidth / 2)
			.attr('y', innerHeight + 40)
			.style('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('fill', '#666')
			.text('Distance');

		// Add cut line for cluster selection
		let cutLine = null;
		let cutHeight = maxDistance / 2;

		function updateCutLine() {
			if (cutLine) cutLine.remove();
			
			cutLine = g.append('line')
				.attr('class', 'cut-line')
				.attr('x1', distanceScale(cutHeight))
				.attr('x2', distanceScale(cutHeight))
				.attr('y1', 0)
				.attr('y2', innerHeight)
				.style('stroke', '#ff4444')
				.style('stroke-width', 2)
				.style('stroke-dasharray', '5,5')
				.style('cursor', 'ew-resize')
				.call(d3.drag()
					.on('drag', function(event) {
						cutHeight = distanceScale.invert(event.x);
						cutHeight = Math.max(0, Math.min(maxDistance, cutHeight));
						updateCutLine();
						highlightClusters();
					})
				);

			g.append('text')
				.attr('x', distanceScale(cutHeight))
				.attr('y', -5)
				.style('text-anchor', 'middle')
				.style('font-size', '10px')
				.style('fill', '#ff4444')
				.text(`Cut: ${cutHeight.toFixed(2)}`);
		}

		function highlightClusters() {
			// Reset colors
			node.selectAll('circle')
				.style('fill', d => d.data.color || (d.children ? '#999' : '#69b3a2'));

			// Color clusters based on cut height
			const clusters = [];
			let clusterId = 0;
			const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

			root.descendants().forEach(d => {
				if ((d.data.height || 0) >= cutHeight && d.children) {
					const clusterColor = colorScale(clusterId++);
					
					// Color all descendants
					d.descendants().forEach(desc => {
						if (!desc.children) { // Only leaf nodes
							node.filter(n => n === desc)
								.select('circle')
								.style('fill', clusterColor);
						}
					});
				}
			});
		}

		updateCutLine();
		highlightClusters();
	}

	function performSimpleClustering(nodes, distances) {
		// Simple agglomerative clustering simulation
		// This is a simplified version - in practice you'd use proper clustering libraries
		
		if (nodes.length <= 1) {
			return nodes[0] || { label: 'Empty', children: [] };
		}

		// Create initial clusters (each node is its own cluster)
		let clusters = nodes.map((node, i) => ({
			...node,
			id: i,
			height: 0,
			children: null
		}));

		let nextId = nodes.length;

		// Merge clusters until only one remains
		while (clusters.length > 1) {
			let minDistance = Infinity;
			let mergeIndices = [0, 1];

			// Find closest pair of clusters
			for (let i = 0; i < clusters.length; i++) {
				for (let j = i + 1; j < clusters.length; j++) {
					const dist = getClusterDistance(clusters[i], clusters[j], distances);
					if (dist < minDistance) {
						minDistance = dist;
						mergeIndices = [i, j];
					}
				}
			}

			// Merge the closest clusters
			const [i, j] = mergeIndices;
			const newCluster = {
				id: nextId++,
				label: `Cluster_${nextId}`,
				height: minDistance,
				children: [clusters[i], clusters[j]]
			};

			// Remove old clusters and add new one
			clusters = clusters.filter((_, index) => index !== i && index !== j);
			clusters.push(newCluster);
		}

		return clusters[0];
	}

	function getClusterDistance(cluster1, cluster2, distances) {
		// Single linkage clustering (minimum distance)
		let minDist = Infinity;

		const nodes1 = getLeafNodes(cluster1);
		const nodes2 = getLeafNodes(cluster2);

		nodes1.forEach(n1 => {
			nodes2.forEach(n2 => {
				if (distances[n1.id] && distances[n1.id][n2.id] !== undefined) {
					minDist = Math.min(minDist, distances[n1.id][n2.id]);
				}
			});
		});

		return minDist === Infinity ? 1 : minDist;
	}

	function getLeafNodes(cluster) {
		if (!cluster.children) {
			return [cluster];
		}
		
		let leaves = [];
		cluster.children.forEach(child => {
			leaves = leaves.concat(getLeafNodes(child));
		});
		return leaves;
	}

	$effect(() => {
		if (svgElement && config?.nodes && config?.distances) {
			createDendrogramChart();
		}
	});
</script>

<div class={`dendrogram-container ${className}`} bind:this={containerElement}>
	{#if config?.title}
		<h3 class="chart-title">{config.title}</h3>
	{/if}
	<svg bind:this={svgElement}></svg>
	<div class="instructions">
		<small>Drag the red dashed line to adjust cluster cut height</small>
	</div>
</div>

<style>
	.dendrogram-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 500px;
	}

	.chart-title {
		margin: 0 0 1rem 0;
		font-size: 1.2rem;
		font-weight: bold;
		text-align: center;
	}

	.instructions {
		margin-top: 10px;
		color: #666;
		font-style: italic;
	}

	svg {
		max-width: 100%;
		flex: 1;
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

	:global(.distance-axis text) {
		font-size: 10px;
		fill: #666;
	}

	:global(.distance-axis .domain) {
		stroke: #666;
	}
</style>

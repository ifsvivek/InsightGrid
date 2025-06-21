<script>
	import { onMount } from 'svelte';

	let { config, title = 'Sankey Diagram', className = '' } = $props();
	let svgElement = $state();
	let resizeObserver = $state();

	onMount(() => {
		if (svgElement && config) {
			createSankeyDiagram();
		}

		// Set up resize observer for responsive behavior
		if (svgElement && svgElement.parentElement) {
			resizeObserver = new ResizeObserver(() => {
				if (config) {
					// Debounce the resize
					setTimeout(() => createSankeyDiagram(), 100);
				}
			});
			resizeObserver.observe(svgElement.parentElement);
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	});

	function createSankeyDiagram() {
		console.log('SankeyChart: Starting diagram creation with config:', $state.snapshot(config));

		// Handle different data formats
		let nodes, links;

		if (config?.data?.nodes && config?.data?.links) {
			// Standard format with data wrapper
			nodes = config.data.nodes;
			links = config.data.links;
			console.log('SankeyChart: Using standard format');
		} else if (config?.nodes && config?.links) {
			// Direct format
			nodes = config.nodes;
			links = config.links;
			console.log('SankeyChart: Using direct format');
		} else {
			console.warn('SankeyChart: Invalid data format. Expected nodes and links.', config);
			return;
		}

		if (!nodes || !links || !Array.isArray(nodes) || !Array.isArray(links)) {
			console.warn('SankeyChart: Nodes and links must be arrays.', { nodes, links });
			return;
		}

		console.log('SankeyChart: Creating diagram with', {
			nodeCount: nodes.length,
			linkCount: links.length,
			nodes: nodes.slice(0, 3), // Log first 3 nodes
			links: links.slice(0, 3) // Log first 3 links
		});

		const svg = svgElement;

		// Get actual container dimensions
		const containerRect = svg.parentElement.getBoundingClientRect();
		const width = Math.max(700, containerRect.width || 700);
		const height = Math.max(450, containerRect.height - 20 || 450); // Small padding from container
		const margin = { top: 60, right: 140, bottom: 40, left: 140 };

		// Clear SVG
		svg.innerHTML = '';
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

		// Remove the background debugging element - it was causing visual issues

		// Improved Sankey layout with responsive sizing
		const nodeWidth = Math.min(40, Math.max(20, width * 0.04));
		const usableHeight = height - margin.top - margin.bottom;
		const usableWidth = width - margin.left - margin.right;

		// Calculate source and target nodes for better layout
		const sourceNodes = new Set();
		const targetNodes = new Set();

		links.forEach((link) => {
			if (link.source < nodes.length && link.target < nodes.length) {
				sourceNodes.add(link.source);
				targetNodes.add(link.target);
			}
		});

		// Separate pure sources, pure targets, and intermediate nodes
		const pureSourceIndices = [...sourceNodes].filter((i) => !targetNodes.has(i));
		const pureTargetIndices = [...targetNodes].filter((i) => !sourceNodes.has(i));
		const intermediateIndices = [...sourceNodes].filter((i) => targetNodes.has(i));

		console.log('SankeyChart: Node categories', {
			pureSources: pureSourceIndices.length,
			pureTargets: pureTargetIndices.length,
			intermediate: intermediateIndices.length,
			dimensions: { width, height, usableWidth, usableHeight }
		});

		const nodeMap = new Map();

		// Position nodes in columns with better spacing
		const columns = [
			{ nodes: pureSourceIndices, x: margin.left },
			{ nodes: intermediateIndices, x: margin.left + usableWidth / 2 - nodeWidth / 2 },
			{ nodes: pureTargetIndices, x: margin.left + usableWidth - nodeWidth }
		];

		columns.forEach((column, columnIndex) => {
			if (column.nodes.length > 0) {
				const nodePadding = Math.max(5, usableHeight * 0.02);
				const totalPadding = (column.nodes.length - 1) * nodePadding;
				const availableHeightForNodes = usableHeight - totalPadding;
				const nodeHeight = Math.max(
					30,
					Math.min(80, availableHeightForNodes / column.nodes.length)
				);

				column.nodes.forEach((nodeIndex, i) => {
					const node = nodes[nodeIndex];
					const y = margin.top + i * (nodeHeight + nodePadding);

					nodeMap.set(node.id, {
						...node,
						x: column.x,
						y: y,
						width: nodeWidth,
						height: nodeHeight
					});
				});
			}
		});

		// Draw links
		const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		linkGroup.setAttribute('class', 'links');

		links.forEach((link, linkIndex) => {
			// link.source and link.target are indices, not node objects
			const sourceNode = nodes[link.source];
			const targetNode = nodes[link.target];
			const source = nodeMap.get(sourceNode?.id);
			const target = nodeMap.get(targetNode?.id);

			console.log(`SankeyChart: Processing link ${linkIndex}:`, {
				sourceIndex: link.source,
				targetIndex: link.target,
				sourceNode: sourceNode?.label,
				targetNode: targetNode?.label,
				source: source ? `${source.x},${source.y}` : 'not found',
				target: target ? `${target.x},${target.y}` : 'not found',
				value: link.value
			});

			if (source && target) {
				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

				// Create curved path
				const sourceX = source.x + source.width;
				const sourceY = source.y + source.height / 2;
				const targetX = target.x;
				const targetY = target.y + target.height / 2;
				const controlX1 = sourceX + (targetX - sourceX) * 0.4;
				const controlX2 = sourceX + (targetX - sourceX) * 0.6;

				const pathData = `M ${sourceX} ${sourceY} 
								 C ${controlX1} ${sourceY}
								   ${controlX2} ${targetY}
								   ${targetX} ${targetY}`;

				// Calculate stroke width based on value and available space
				const maxStrokeWidth = Math.min(20, usableHeight * 0.05);
				const minStrokeWidth = 2;
				const maxValue = Math.max(...links.map((l) => l.value));
				const strokeWidth = Math.max(
					minStrokeWidth,
					Math.min(maxStrokeWidth, (link.value / maxValue) * maxStrokeWidth)
				);

				path.setAttribute('d', pathData);
				path.setAttribute('stroke', link.color || '#4CAF50');
				path.setAttribute('stroke-width', String(strokeWidth));
				path.setAttribute('fill', 'none');
				path.setAttribute('opacity', '0.7');
				path.setAttribute('stroke-linecap', 'round');

				// Add hover effects
				path.addEventListener('mouseenter', () => {
					path.setAttribute('opacity', '0.9');
					path.setAttribute(
						'stroke-width',
						String(Math.min(maxStrokeWidth * 1.2, strokeWidth * 1.3))
					);
				});

				path.addEventListener('mouseleave', () => {
					path.setAttribute('opacity', '0.7');
					path.setAttribute('stroke-width', String(strokeWidth));
				});

				// Add tooltip
				const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
				title.textContent = `${source.label} → ${target.label}: ${link.value}`;
				path.appendChild(title);

				linkGroup.appendChild(path);
			} else {
				console.warn(`SankeyChart: Could not find nodes for link ${linkIndex}`, {
					sourceFound: !!source,
					targetFound: !!target,
					sourceNodeId: sourceNode?.id,
					targetNodeId: targetNode?.id
				});
			}
		});

		svg.appendChild(linkGroup);

		// Draw nodes
		const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		nodeGroup.setAttribute('class', 'nodes');

		const colors = [
			'#FF6B6B',
			'#4ECDC4',
			'#45B7D1',
			'#96CEB4',
			'#FFEAA7',
			'#DDA0DD',
			'#98D8C8',
			'#F7DC6F',
			'#BB8FCE'
		];
		let colorIndex = 0;

		nodeMap.forEach((node, nodeId) => {
			console.log(`SankeyChart: Drawing node ${nodeId}:`, {
				x: node.x,
				y: node.y,
				width: node.width,
				height: node.height,
				label: node.label
			});

			const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			rect.setAttribute('x', String(node.x));
			rect.setAttribute('y', String(node.y));
			rect.setAttribute('width', String(node.width));
			rect.setAttribute('height', String(node.height));
			rect.setAttribute('fill', node.color || colors[colorIndex % colors.length]);
			rect.setAttribute('stroke', '#333');
			rect.setAttribute('stroke-width', '2');
			rect.setAttribute('rx', '5');

			// Add hover effects
			rect.addEventListener('mouseenter', () => {
				rect.setAttribute('opacity', '0.8');
				rect.setAttribute('stroke-width', '3');
			});

			rect.addEventListener('mouseleave', () => {
				rect.setAttribute('opacity', '1');
				rect.setAttribute('stroke-width', '2');
			});

			// Add node label with better positioning and responsive font size
			const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			const isLeftSide = node.x < width / 2;
			const textX = isLeftSide ? node.x + node.width + 8 : node.x - 8;
			const textAnchor = isLeftSide ? 'start' : 'end';
			const fontSize = Math.max(10, Math.min(14, width * 0.018));

			text.setAttribute('x', String(textX));
			text.setAttribute('y', String(node.y + node.height / 2));
			text.setAttribute('dy', '0.35em');
			text.setAttribute('font-size', String(fontSize));
			text.setAttribute('font-weight', 'bold');
			text.setAttribute('fill', '#333');
			text.setAttribute('text-anchor', textAnchor);

			// Truncate long labels if necessary
			const maxLabelLength = Math.max(8, Math.floor(usableWidth / (fontSize * 8)));
			const label = node.label || `Node ${nodeId}`;
			text.textContent =
				label.length > maxLabelLength ? label.substring(0, maxLabelLength - 3) + '...' : label;

			// Add tooltip
			const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
			title.textContent = `${node.label}: ${node.value || 'N/A'}`;
			rect.appendChild(title);

			nodeGroup.appendChild(rect);
			nodeGroup.appendChild(text);

			colorIndex++;
		});

		svg.appendChild(nodeGroup);

		// Add title with responsive sizing
		const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		const titleFontSize = Math.max(14, Math.min(20, width * 0.025));
		titleElement.setAttribute('x', String(width / 2));
		titleElement.setAttribute('y', String(margin.top / 2));
		titleElement.setAttribute('text-anchor', 'middle');
		titleElement.setAttribute('font-size', String(titleFontSize));
		titleElement.setAttribute('font-weight', 'bold');
		titleElement.setAttribute('fill', '#333');
		titleElement.textContent = title || 'Sankey Diagram';
		svg.appendChild(titleElement);

		console.log('SankeyChart: Diagram creation completed successfully');
	}

	$effect(() => {
		if (config && svgElement) {
			createSankeyDiagram();
		}
	});
</script>

<div class={`sankey-container ${className}`}>
	{#if !config}
		<div class="error-message">
			<div class="error-icon">📊</div>
			<p>No data available for Sankey diagram</p>
		</div>
	{:else}
		<svg bind:this={svgElement} class="sankey-svg"></svg>
	{/if}
</div>

<style>
	.sankey-container {
		position: relative;
		height: 400px;
		width: 100%;
		background: #ffffff00;
		margin: 16px 0;
		overflow: hidden;
	}

	.sankey-svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	.error-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #666;
		font-style: italic;
	}

	.error-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.error-message p {
		margin: 0;
		font-size: 16px;
	}
</style>

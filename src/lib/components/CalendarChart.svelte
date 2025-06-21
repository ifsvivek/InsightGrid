<script>
	import { onMount } from 'svelte';

	let { config, title = 'Calendar Heatmap', className = '' } = $props();
	let svgElement;

	onMount(() => {
		if (svgElement && config) {
			createCalendarHeatmap();
		}
	});

	function createCalendarHeatmap() {
		if (!config?.data) return;

		const data = config.data;
		const svg = svgElement;
		const cellSize = 15;
		const padding = 2;
		const width = 800;
		const height = 400;

		// Clear SVG
		svg.innerHTML = '';
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

		// Get date range
		const dates = data.map(d => new Date(d.date)).sort((a, b) => a - b);
		const startDate = dates[0];
		const endDate = dates[dates.length - 1];

		// Create date map
		const dateMap = new Map();
		data.forEach(d => {
			dateMap.set(d.date, d);
		});

		// Create year layout
		const startYear = startDate.getFullYear();
		const endYear = endDate.getFullYear();
		
		let yOffset = 40;

		for (let year = startYear; year <= endYear; year++) {
			// Year label
			const yearLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			yearLabel.setAttribute('x', '10');
			yearLabel.setAttribute('y', String(yOffset - 10));
			yearLabel.setAttribute('font-size', '14');
			yearLabel.setAttribute('font-weight', 'bold');
			yearLabel.setAttribute('fill', '#333');
			yearLabel.textContent = String(year);
			svg.appendChild(yearLabel);

			// Month labels
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
						   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			
			months.forEach((month, monthIndex) => {
				const monthLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				monthLabel.setAttribute('x', String(50 + monthIndex * (cellSize + padding) * 4.3));
				monthLabel.setAttribute('y', String(yOffset - 10));
				monthLabel.setAttribute('font-size', '10');
				monthLabel.setAttribute('fill', '#666');
				monthLabel.textContent = month;
				svg.appendChild(monthLabel);
			});

			// Day labels
			const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
			days.forEach((day, dayIndex) => {
				const dayLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
				dayLabel.setAttribute('x', '30');
				dayLabel.setAttribute('y', String(yOffset + dayIndex * (cellSize + padding) + 12));
				dayLabel.setAttribute('font-size', '10');
				dayLabel.setAttribute('fill', '#666');
				dayLabel.textContent = day;
				svg.appendChild(dayLabel);
			});

			// Draw calendar grid for the year
			for (let month = 0; month < 12; month++) {
				const firstDay = new Date(year, month, 1);
				const lastDay = new Date(year, month + 1, 0);
				const startDay = firstDay.getDay(); // 0 = Sunday

				for (let day = 1; day <= lastDay.getDate(); day++) {
					const currentDate = new Date(year, month, day);
					const dateStr = currentDate.toISOString().split('T')[0];
					const dayOfWeek = currentDate.getDay();
					const weekOfYear = Math.floor((currentDate - firstDay) / (7 * 24 * 60 * 60 * 1000));

					const x = 50 + (month * 4.3 + weekOfYear) * (cellSize + padding);
					const y = yOffset + dayOfWeek * (cellSize + padding);

					const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					rect.setAttribute('x', String(x));
					rect.setAttribute('y', String(y));
					rect.setAttribute('width', String(cellSize));
					rect.setAttribute('height', String(cellSize));
					rect.setAttribute('rx', '2');

					const dataPoint = dateMap.get(dateStr);
					if (dataPoint) {
						rect.setAttribute('fill', dataPoint.color || '#69b3a2');
						rect.setAttribute('opacity', String(dataPoint.intensity || 0.7));
					} else {
						rect.setAttribute('fill', '#eee');
						rect.setAttribute('opacity', '0.3');
					}

					rect.setAttribute('stroke', '#fff');
					rect.setAttribute('stroke-width', '1');

					// Add hover effects
					rect.addEventListener('mouseenter', () => {
						rect.setAttribute('stroke', '#333');
						rect.setAttribute('stroke-width', '2');
					});
					
					rect.addEventListener('mouseleave', () => {
						rect.setAttribute('stroke', '#fff');
						rect.setAttribute('stroke-width', '1');
					});

					// Add tooltip
					const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
					title.textContent = dataPoint ? 
						`${dateStr}: ${dataPoint.value}` : 
						`${dateStr}: No data`;
					rect.appendChild(title);

					svg.appendChild(rect);
				}
			}

			yOffset += 180; // Space for next year
		}
	}

	$effect(() => {
		if (config && svgElement) {
			createCalendarHeatmap();
		}
	});
</script>

<div class={`calendar-container ${className}`}>
	<svg bind:this={svgElement} class="calendar-svg"></svg>
</div>

<style>
	.calendar-container {
		position: relative;
		height: 400px;
		width: 100%;
		overflow: auto;
	}

	.calendar-svg {
		width: 100%;
		min-height: 100%;
	}
</style>

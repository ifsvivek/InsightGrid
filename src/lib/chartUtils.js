// Chart utility functions for converting AI templates to Chart.js configs

/**
 * Convert a chart template to a Chart.js configuration using full dataset
 * @param {Object} template - The chart template from AI
 * @param {Array} fullData - Complete dataset
 * @param {Array} columns - Column names
 * @returns {Object} Chart.js configuration
 */
export function templateToChartConfig(template, fullData, columns) {
	try {
		const config = {
			type: template.chartType,
			data: generateChartData(template, fullData),
			options: generateChartOptions(template)
		};

		return config;
	} catch (error) {
		console.error('Error in templateToChartConfig:', error);
		throw error;
	}
}

/**
 * Generate Chart.js data object from template and dataset
 */
function generateChartData(template, fullData) {
	const { chartType, xAxis, yAxis, groupBy, aggregation, colorScheme } = template;

	switch (chartType) {
		case 'line':
		case 'bar':
		case 'horizontalBar':
			return generateXYChartData(template, fullData);
		case 'area':
			return generateAreaChartData(template, fullData);
		case 'pie':
		case 'doughnut':
			return generatePieChartData(template, fullData);
		case 'polarArea':
			return generatePolarAreaData(template, fullData);
		case 'radar':
			return generateRadarData(template, fullData);
		case 'scatter':
			return generateScatterData(template, fullData);
		case 'bubble':
			return generateBubbleData(template, fullData);
		case 'mixed':
			return generateMixedChartData(template, fullData);
		case 'histogram':
			return generateHistogramData(template, fullData);
		case 'boxplot':
			return generateBoxPlotData(template, fullData);
		case 'heatmap':
			return generateHeatmapData(template, fullData);
		case 'waterfall':
			return generateWaterfallData(template, fullData);
		case 'funnel':
			return generateFunnelData(template, fullData);
		case 'treemap':
			return generateTreemapData(template, fullData);
		case 'sunburst':
			return generateSunburstData(template, fullData);
		case 'gauge':
			return generateGaugeData(template, fullData);
		case 'sankey':
			return generateSankeyData(template, fullData);
		case 'candlestick':
			return generateCandlestickData(template, fullData);
		case 'violin':
			return generateViolinData(template, fullData);
		case 'streamgraph':
			return generateStreamgraphData(template, fullData);
		case 'parallel':
			return generateParallelCoordinatesData(template, fullData);
		case 'marimekko':
			return generateMarimekkoData(template, fullData);
		case 'network':
			return generateNetworkData(template, fullData);
		case 'chord':
			return generateChordData(template, fullData);
		case 'alluvial':
			return generateAlluvialData(template, fullData);
		case 'radialBar':
			return generateRadialBarData(template, fullData);
		case 'calendar':
			return generateCalendarData(template, fullData);
		case 'slope':
			return generateSlopeData(template, fullData);
		case 'ridgeline':
			return generateRidgelineData(template, fullData);
		case 'wordcloud':
			return generateWordCloudData(template, fullData);
		case 'dendogram':
			return generateDendogramData(template, fullData);
		case 'step':
			return generateStepData(template, fullData);
		case 'area-spline':
			return generateAreaSplineData(template, fullData);
		case 'radial-column':
			return generateRadialColumnData(template, fullData);
		case 'spider':
			return generateSpiderData(template, fullData);
		case 'bullet':
			return generateBulletData(template, fullData);
		case 'gantt':
			return generateGanttData(template, fullData);
		case 'pictogram':
			return generatePictogramData(template, fullData);
		case 'dot-plot':
			return generateDotPlotData(template, fullData);
		case 'lollipop':
			return generateLollipopData(template, fullData);
		case 'bump':
			return generateBumpData(template, fullData);
		default:
			return generateXYChartData(template, fullData);
	}
}

/**
 * Generate data for line/bar charts
 */
function generateXYChartData(template, fullData) {
	const { xAxis, yAxis, groupBy, aggregation, colorScheme } = template;

	let processedData;

	if (aggregation && aggregation !== 'none') {
		processedData = aggregateData(fullData, xAxis, yAxis, aggregation, groupBy);
	} else {
		processedData = fullData
			.map((row) => ({
				x: row[xAxis],
				y: row[yAxis]
			}))
			.filter((point) => point.x !== null && point.y !== null);
	}

	const labels = [...new Set(processedData.map((item) => item.x))].sort();

	if (groupBy && groupBy !== xAxis) {
		// Multiple datasets for grouped data
		const groups = [...new Set(fullData.map((row) => row[groupBy]))];

		const datasets = groups.map((group, index) => {
			const groupData = processedData.filter((item) =>
				fullData.find((row) => row[xAxis] === item.x && row[groupBy] === group)
			);

			const dataset = {
				label: String(group),
				data: labels.map((label) => {
					const point = groupData.find((item) => item.x === label);
					return point ? point.y : 0;
				}),
				backgroundColor: getColorFromScheme(colorScheme, index),
				borderColor: getColorFromScheme(colorScheme, index),
				tension: template.chartType === 'line' ? 0.4 : 0
			};

			return dataset;
		});

		return { labels, datasets };
	} else {
		// Single dataset
		const dataset = {
			label: yAxis,
			data: labels.map((label) => {
				const point = processedData.find((item) => item.x === label);
				return point ? point.y : 0;
			}),
			backgroundColor: getColorFromScheme(colorScheme, 0),
			borderColor: getColorFromScheme(colorScheme, 0),
			tension: template.chartType === 'line' ? 0.4 : 0
		};

		return { labels, datasets: [dataset] };
	}
}

/**
 * Generate data for pie/doughnut charts
 */
function generatePieChartData(template, fullData) {
	const { xAxis, yAxis, aggregation, colorScheme } = template;

	let aggregatedData;
	if (aggregation && aggregation !== 'none') {
		aggregatedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		// Count occurrences if no aggregation specified
		const counts = {};
		fullData.forEach((row) => {
			const key = row[xAxis];
			if (key !== null && key !== undefined) {
				counts[key] = (counts[key] || 0) + (row[yAxis] || 1);
			}
		});
		aggregatedData = Object.entries(counts).map(([x, y]) => ({ x, y }));
	}

	const labels = aggregatedData.map((item) => String(item.x));
	const data = aggregatedData.map((item) => item.y);

	return {
		labels,
		datasets: [
			{
				data,
				backgroundColor: labels.map((_, index) => getColorFromScheme(colorScheme, index)),
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for scatter plots
 */
function generateScatterData(template, fullData) {
	const { xAxis, yAxis, colorScheme } = template;

	const data = fullData
		.filter((row) => row[xAxis] !== null && row[yAxis] !== null)
		.map((row) => ({
			x: row[xAxis],
			y: row[yAxis]
		}));

	return {
		datasets: [
			{
				label: `${yAxis} vs ${xAxis}`,
				data,
				backgroundColor: getColorFromScheme(colorScheme, 0),
				borderColor: getColorFromScheme(colorScheme, 0)
			}
		]
	};
}

/**
 * Generate data for area charts (line chart with fill)
 */
function generateAreaChartData(template, fullData) {
	const baseData = generateXYChartData(template, fullData);
	
	// Add fill configuration for area effect
	baseData.datasets = baseData.datasets.map((dataset, index) => ({
		...dataset,
		fill: true,
		backgroundColor: getColorFromScheme(template.colorScheme, index, 0.3), // Semi-transparent
		tension: 0.4
	}));

	return baseData;
}

/**
 * Generate data for polar area charts
 */
function generatePolarAreaData(template, fullData) {
	const { xAxis, yAxis, aggregation, colorScheme } = template;

	let aggregatedData;
	if (aggregation && aggregation !== 'none') {
		aggregatedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		const counts = {};
		fullData.forEach((row) => {
			const key = row[xAxis];
			if (key !== null && key !== undefined) {
				counts[key] = (counts[key] || 0) + (row[yAxis] || 1);
			}
		});
		aggregatedData = Object.entries(counts).map(([x, y]) => ({ x, y }));
	}

	const labels = aggregatedData.map((item) => String(item.x));
	const data = aggregatedData.map((item) => item.y);

	return {
		labels,
		datasets: [
			{
				data,
				backgroundColor: labels.map((_, index) => getColorFromScheme(colorScheme, index, 0.7)),
				borderColor: labels.map((_, index) => getColorFromScheme(colorScheme, index)),
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for radar charts
 */
function generateRadarData(template, fullData) {
	const { xAxis, yAxis, groupBy, aggregation, colorScheme } = template;

	if (groupBy && groupBy !== xAxis) {
		// Multiple datasets for comparison
		const groups = [...new Set(fullData.map((row) => row[groupBy]))];
		const categories = [...new Set(fullData.map((row) => row[xAxis]))];

		const datasets = groups.map((group, index) => {
			const groupData = categories.map((category) => {
				const relevantRows = fullData.filter(
					(row) => row[xAxis] === category && row[groupBy] === group
				);
				
				if (relevantRows.length === 0) return 0;

				if (aggregation === 'sum') {
					return relevantRows.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0);
				} else if (aggregation === 'avg') {
					const sum = relevantRows.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0);
					return sum / relevantRows.length;
				} else {
					return relevantRows.length;
				}
			});

			return {
				label: String(group),
				data: groupData,
				backgroundColor: getColorFromScheme(colorScheme, index, 0.2),
				borderColor: getColorFromScheme(colorScheme, index),
				borderWidth: 2
			};
		});

		return { labels: categories, datasets };
	} else {
		// Single dataset
		const aggregatedData = aggregateData(fullData, xAxis, yAxis, aggregation || 'sum');
		
		return {
			labels: aggregatedData.map((item) => String(item.x)),
			datasets: [
				{
					label: yAxis,
					data: aggregatedData.map((item) => item.y),
					backgroundColor: getColorFromScheme(colorScheme, 0, 0.2),
					borderColor: getColorFromScheme(colorScheme, 0),
					borderWidth: 2
				}
			]
		};
	}
}

/**
 * Generate data for bubble charts
 */
function generateBubbleData(template, fullData) {
	const { xAxis, yAxis, sizeAxis, colorScheme } = template;

	const data = fullData
		.filter((row) => 
			row[xAxis] !== null && 
			row[yAxis] !== null && 
			(sizeAxis ? row[sizeAxis] !== null : true)
		)
		.map((row) => ({
			x: Number(row[xAxis]) || 0,
			y: Number(row[yAxis]) || 0,
			r: sizeAxis ? Math.max(3, Math.min(20, Number(row[sizeAxis]) || 5)) : 5
		}));

	return {
		datasets: [
			{
				label: `${yAxis} vs ${xAxis}${sizeAxis ? ` (size: ${sizeAxis})` : ''}`,
				data,
				backgroundColor: getColorFromScheme(colorScheme, 0, 0.6),
				borderColor: getColorFromScheme(colorScheme, 0),
				borderWidth: 1
			}
		]
	};
}

/**
 * Generate data for mixed charts (combination of line and bar)
 */
function generateMixedChartData(template, fullData) {
	const { xAxis, yAxis, yAxis2, groupBy, aggregation, colorScheme } = template;

	let processedData1, processedData2;

	if (aggregation && aggregation !== 'none') {
		processedData1 = aggregateData(fullData, xAxis, yAxis, aggregation);
		processedData2 = yAxis2 ? aggregateData(fullData, xAxis, yAxis2, aggregation) : [];
	} else {
		processedData1 = fullData
			.map((row) => ({ x: row[xAxis], y: row[yAxis] }))
			.filter((point) => point.x !== null && point.y !== null);
		processedData2 = yAxis2 ? fullData
			.map((row) => ({ x: row[xAxis], y: row[yAxis2] }))
			.filter((point) => point.x !== null && point.y !== null) : [];
	}

	const labels = [...new Set(processedData1.map((item) => item.x))].sort();

	const datasets = [
		{
			type: 'bar',
			label: yAxis,
			data: labels.map((label) => {
				const point = processedData1.find((item) => item.x === label);
				return point ? point.y : 0;
			}),
			backgroundColor: getColorFromScheme(colorScheme, 0, 0.7),
			borderColor: getColorFromScheme(colorScheme, 0),
			yAxisID: 'y'
		}
	];

	if (yAxis2 && processedData2.length > 0) {
		datasets.push({
			type: 'line',
			label: yAxis2,
			data: labels.map((label) => {
				const point = processedData2.find((item) => item.x === label);
				return point ? point.y : 0;
			}),
			backgroundColor: getColorFromScheme(colorScheme, 1, 0.2),
			borderColor: getColorFromScheme(colorScheme, 1),
			tension: 0.4,
			yAxisID: 'y1'
		});
	}

	return { labels, datasets };
}

/**
 * Generate data for histogram
 */
function generateHistogramData(template, fullData) {
	const { xAxis, bins = 10, colorScheme } = template;

	const values = fullData
		.map((row) => Number(row[xAxis]))
		.filter((val) => !isNaN(val));

	if (values.length === 0) return { labels: [], datasets: [] };

	const min = Math.min(...values);
	const max = Math.max(...values);
	const binWidth = (max - min) / bins;

	const histogram = new Array(bins).fill(0);
	const labels = [];

	for (let i = 0; i < bins; i++) {
		const binStart = min + i * binWidth;
		const binEnd = min + (i + 1) * binWidth;
		labels.push(`${binStart.toFixed(1)}-${binEnd.toFixed(1)}`);

		values.forEach((value) => {
			if (value >= binStart && (value < binEnd || (i === bins - 1 && value === binEnd))) {
				histogram[i]++;
			}
		});
	}

	return {
		labels,
		datasets: [
			{
				label: `Distribution of ${xAxis}`,
				data: histogram,
				backgroundColor: getColorFromScheme(colorScheme, 0, 0.7),
				borderColor: getColorFromScheme(colorScheme, 0),
				borderWidth: 1
			}
		]
	};
}

/**
 * Generate data for box plot (using Chart.js with custom rendering)
 */
function generateBoxPlotData(template, fullData) {
	const { xAxis, yAxis, groupBy, colorScheme } = template;

	if (groupBy) {
		const groups = [...new Set(fullData.map((row) => row[groupBy]))];
		
		const datasets = groups.map((group, index) => {
			const groupValues = fullData
				.filter((row) => row[groupBy] === group)
				.map((row) => Number(row[yAxis]))
				.filter((val) => !isNaN(val))
				.sort((a, b) => a - b);

			const stats = calculateBoxPlotStats(groupValues);

			return {
				label: String(group),
				data: [stats],
				backgroundColor: getColorFromScheme(colorScheme, index, 0.7),
				borderColor: getColorFromScheme(colorScheme, index),
				borderWidth: 1
			};
		});

		return { labels: groups, datasets };
	} else {
		const values = fullData
			.map((row) => Number(row[yAxis]))
			.filter((val) => !isNaN(val))
			.sort((a, b) => a - b);

		const stats = calculateBoxPlotStats(values);

		return {
			labels: [yAxis],
			datasets: [
				{
					label: yAxis,
					data: [stats],
					backgroundColor: getColorFromScheme(colorScheme, 0, 0.7),
					borderColor: getColorFromScheme(colorScheme, 0),
					borderWidth: 1
				}
			]
		};
	}
}

/**
 * Generate data for heatmap (correlation matrix or pivot table)
 */
function generateHeatmapData(template, fullData) {
	const { xAxis, yAxis, valueAxis, aggregation = 'sum', colorScheme } = template;

	const xValues = [...new Set(fullData.map((row) => row[xAxis]))].sort();
	const yValues = [...new Set(fullData.map((row) => row[yAxis]))].sort();

	const heatmapData = [];

	yValues.forEach((yVal, yIndex) => {
		xValues.forEach((xVal, xIndex) => {
			const relevantRows = fullData.filter(
				(row) => row[xAxis] === xVal && row[yAxis] === yVal
			);

			let value = 0;
			if (relevantRows.length > 0) {
				if (aggregation === 'sum') {
					value = relevantRows.reduce((sum, row) => sum + (Number(row[valueAxis]) || 0), 0);
				} else if (aggregation === 'avg') {
					const sum = relevantRows.reduce((sum, row) => sum + (Number(row[valueAxis]) || 0), 0);
					value = sum / relevantRows.length;
				} else if (aggregation === 'count') {
					value = relevantRows.length;
				}
			}

			heatmapData.push({
				x: xIndex,
				y: yIndex,
				v: value
			});
		});
	});

	return {
		labels: xValues,
		datasets: [
			{
				label: `${valueAxis} by ${xAxis} and ${yAxis}`,
				data: heatmapData,
				backgroundColor: function(context) {
					const value = context.parsed.v;
					const maxValue = Math.max(...heatmapData.map(d => d.v));
					const intensity = maxValue > 0 ? value / maxValue : 0;
					return getColorFromScheme(colorScheme, 0, intensity);
				},
				borderColor: getColorFromScheme(colorScheme, 0),
				borderWidth: 1,
				width: ({chart}) => (chart.chartArea || {}).width / xValues.length - 1,
				height: ({chart}) => (chart.chartArea || {}).height / yValues.length - 1
			}
		]
	};
}

/**
 * Calculate box plot statistics
 */
function calculateBoxPlotStats(values) {
	if (values.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };

	const q1Index = Math.floor(values.length * 0.25);
	const medianIndex = Math.floor(values.length * 0.5);
	const q3Index = Math.floor(values.length * 0.75);

	return {
		min: values[0],
		q1: values[q1Index],
		median: values[medianIndex],
		q3: values[q3Index],
		max: values[values.length - 1]
	};
}

/**
 * Generate Chart.js options based on template
 */
function generateChartOptions(template) {
	const baseOptions = {
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
		}
	};

	// Add specific options based on chart type
	switch (template.chartType) {
		case 'line':
		case 'bar':
		case 'area':
		case 'horizontalBar':
			baseOptions.scales = {
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
			};
			
			if (template.chartType === 'horizontalBar') {
				baseOptions.indexAxis = 'y';
			}
			break;

		case 'mixed':
			baseOptions.scales = {
				x: {
					title: {
						display: true,
						text: template.xAxis
					}
				},
				y: {
					type: 'linear',
					position: 'left',
					title: {
						display: true,
						text: template.yAxis
					}
				},
				y1: {
					type: 'linear',
					position: 'right',
					title: {
						display: true,
						text: template.yAxis2 || 'Secondary Axis'
					},
					grid: {
						drawOnChartArea: false
					}
				}
			};
			break;

		case 'scatter':
		case 'bubble':
			baseOptions.scales = {
				x: {
					type: 'linear',
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
			};
			break;

		case 'radar':
			baseOptions.scales = {
				r: {
					beginAtZero: true,
					grid: {
						color: 'rgba(0, 0, 0, 0.1)'
					},
					pointLabels: {
						font: {
							size: 12
						}
					}
				}
			};
			break;

		case 'histogram':
			baseOptions.scales = {
				x: {
					title: {
						display: true,
						text: `${template.xAxis} (Bins)`
					}
				},
				y: {
					title: {
						display: true,
						text: 'Frequency'
					}
				}
			};
			break;

		case 'boxplot':
			baseOptions.scales = {
				x: {
					title: {
						display: true,
						text: template.groupBy || template.xAxis
					}
				},
				y: {
					title: {
						display: true,
						text: template.yAxis
					}
				}
			};
			// Note: Box plot requires additional Chart.js plugins
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const stats = context.raw;
						return [
							`Min: ${stats.min}`,
							`Q1: ${stats.q1}`,
							`Median: ${stats.median}`,
							`Q3: ${stats.q3}`,
							`Max: ${stats.max}`
						];
					}
				}
			};
			break;

		case 'heatmap':
			baseOptions.scales = {
				x: {
					type: 'linear',
					position: 'bottom',
					min: 0,
					title: {
						display: true,
						text: template.xAxis
					}
				},
				y: {
					type: 'linear',
					min: 0,
					title: {
						display: true,
						text: template.yAxis
					}
				}
			};
			baseOptions.plugins.tooltip = {
				callbacks: {
					title: function() {
						return '';
					},
					label: function(context) {
						return `Value: ${context.parsed.v}`;
					}
				}
			};
			break;

		case 'waterfall':
			baseOptions.scales = {
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
					},
					stacked: true
				}
			};
			break;

		case 'funnel':
		case 'treemap':
		case 'sunburst':
			// These chart types don't need scales
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const data = context.dataset.data[context.dataIndex];
						return `${data.label || ''}: ${data.value || context.parsed}`;
					}
				}
			};
			break;

		case 'gauge':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const dataset = context.dataset;
						return [
							`Current: ${dataset.currentValue}`,
							`Range: ${dataset.minValue} - ${dataset.maxValue}`
						];
					}
				}
			};
			break;

		case 'sankey':
		case 'network':
		case 'chord':
		case 'alluvial':
			// Network-based charts need custom rendering
			baseOptions.plugins.tooltip = {
				callbacks: {
					title: function() {
						return '';
					},
					label: function(context) {
						return `Flow: ${context.parsed}`;
					}
				}
			};
			break;

		case 'calendar':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const data = context.dataset.data[context.dataIndex];
						return `${data.date}: ${data.value}`;
					}
				}
			};
			break;

		case 'slope':
		case 'bump':
			baseOptions.scales = {
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
					},
					reverse: template.chartType === 'bump' // Rankings go from 1 to N
				}
			};
			break;

		case 'ridgeline':
		case 'violin':
			baseOptions.scales = {
				x: {
					title: {
						display: true,
						text: template.xAxis || 'Value'
					}
				},
				y: {
					title: {
						display: true,
						text: 'Density'
					}
				}
			};
			break;

		case 'wordcloud':
			// Word cloud doesn't use traditional scales
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const word = context.dataset.words[context.dataIndex];
						return `${word.text}: ${word.value}`;
					}
				}
			};
			break;

		case 'dendogram':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const node = context.dataset.nodes[context.dataIndex];
						return `${node.label}: Distance ${node.height}`;
					}
				}
			};
			break;

		case 'step':
		case 'area-spline':
			baseOptions.scales = {
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
			};
			break;

		case 'radial-column':
		case 'radialBar':
			baseOptions.scales = {
				r: {
					beginAtZero: true,
					grid: {
						color: 'rgba(0, 0, 0, 0.1)'
					}
				}
			};
			break;

		case 'bullet':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const data = context.dataset.data[context.dataIndex];
						return [
							`Value: ${data.value}`,
							`Target: ${data.target}`,
							`Range: ${data.range}`
						];
					}
				}
			};
			break;

		case 'gantt':
			baseOptions.scales = {
				x: {
					type: 'time',
					title: {
						display: true,
						text: 'Timeline'
					}
				},
				y: {
					title: {
						display: true,
						text: 'Tasks'
					}
				}
			};
			break;

		case 'pictogram':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const data = context.dataset.data[context.dataIndex];
						return `${data.label}: ${data.value} (${data.iconCount} icons)`;
					}
				}
			};
			break;

		case 'dot-plot':
			baseOptions.scales = {
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
			};
			break;

		case 'lollipop':
			baseOptions.scales = {
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
			};
			break;

		case 'parallel':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						return `Row ${context.dataIndex}: Multiple dimensions`;
					}
				}
			};
			break;

		case 'marimekko':
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const data = context.dataset.data[context.dataIndex];
						return `${data.xLabel} × ${data.yLabel}: ${data.value}`;
					}
				}
			};
			break;

		case 'pie':
		case 'doughnut':
		case 'polarArea':
			// These chart types don't need scales
			baseOptions.plugins.tooltip = {
				callbacks: {
					label: function(context) {
						const label = context.label || '';
						const value = context.parsed;
						const total = context.dataset.data.reduce((a, b) => a + b, 0);
						const percentage = ((value / total) * 100).toFixed(1);
						return `${label}: ${value} (${percentage}%)`;
					}
				}
			};
			break;
	}

	return baseOptions;
}

/**
 * Get color from predefined color schemes
 */
function getColorFromScheme(scheme, index, alpha = 1) {
	const colorSchemes = {
		blue: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A', '#312E81'],
		green: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
		red: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
		purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
		orange: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
		teal: ['#14B8A6', '#0D9488', '#0F766E', '#115E59', '#134E4A'],
		pink: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'],
		indigo: ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'],
		rainbow: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'],
		pastel: ['#93C5FD', '#86EFAC', '#FDE68A', '#FCA5A5', '#C4B5FD', '#7DD3FC', '#BEF264'],
		dark: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF'],
		warm: ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D'],
		cool: ['#0EA5E9', '#0284C7', '#0369A1', '#075985', '#0C4A6E']
	};

	const colors = colorSchemes[scheme] || colorSchemes.blue;
	const color = colors[index % colors.length];
	
	// Convert hex to rgba if alpha is specified
	if (alpha !== 1) {
		const r = parseInt(color.slice(1, 3), 16);
		const g = parseInt(color.slice(3, 5), 16);
		const b = parseInt(color.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
	
	return color;
}

/**
 * Parse AI template response and clean it
 */
export function parseChartTemplates(templateResponse) {
	try {
		// Remove markdown code blocks if present
		let cleanData = templateResponse;

		if (cleanData.includes('```json')) {
			cleanData = cleanData.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
		}
		if (cleanData.includes('```')) {
			cleanData = cleanData.replace(/```[\s\S]*?\n/g, '').replace(/```\s*$/g, '');
		}

		// Try to extract JSON array or object from the text
		let jsonMatch = cleanData.match(/\[[\s\S]*\]/); // Look for array first
		if (!jsonMatch) {
			jsonMatch = cleanData.match(/\{[\s\S]*\}/); // Fallback to object
		}

		if (jsonMatch) {
			cleanData = jsonMatch[0];
		}

		// Clean up common JSON issues
		cleanData = cleanData.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').trim();

		const parsed = JSON.parse(cleanData);

		// Handle both array format and object format
		if (Array.isArray(parsed)) {
			return parsed;
		} else if (parsed.chartTemplates && Array.isArray(parsed.chartTemplates)) {
			return parsed.chartTemplates;
		} else {
			return [];
		}
	} catch (error) {
		console.error('Template parsing error:', error);
		console.error('Raw response:', templateResponse);
		return [];
	}
}

/**
 * Generate data for waterfall chart
 */
function generateWaterfallData(template, fullData) {
	const { xAxis, yAxis, colorScheme } = template;

	const data = fullData
		.map((row) => ({
			x: row[xAxis],
			y: Number(row[yAxis]) || 0
		}))
		.filter((point) => point.x !== null);

	// Calculate cumulative values for waterfall effect
	let cumulative = 0;
	const waterfallData = data.map((point, index) => {
		const previousCumulative = cumulative;
		cumulative += point.y;
		
		return {
			label: String(point.x),
			value: point.y,
			cumulative: cumulative,
			start: previousCumulative,
			end: cumulative,
			isPositive: point.y >= 0
		};
	});

	const labels = waterfallData.map(item => item.label);
	const positiveData = waterfallData.map(item => item.isPositive ? item.value : 0);
	const negativeData = waterfallData.map(item => !item.isPositive ? Math.abs(item.value) : 0);

	return {
		labels,
		datasets: [
			{
				label: 'Positive Changes',
				data: positiveData,
				backgroundColor: getColorFromScheme(colorScheme, 0, 0.7),
				borderColor: getColorFromScheme(colorScheme, 0),
				borderWidth: 1
			},
			{
				label: 'Negative Changes',
				data: negativeData,
				backgroundColor: getColorFromScheme('red', 0, 0.7),
				borderColor: getColorFromScheme('red', 0),
				borderWidth: 1
			}
		]
	};
}

/**
 * Generate data for funnel chart
 */
function generateFunnelData(template, fullData) {
	const { xAxis, yAxis, aggregation = 'sum', colorScheme } = template;

	let processedData;
	if (aggregation && aggregation !== 'none') {
		processedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		const counts = {};
		fullData.forEach((row) => {
			const key = row[xAxis];
			if (key !== null && key !== undefined) {
				counts[key] = (counts[key] || 0) + (Number(row[yAxis]) || 1);
			}
		});
		processedData = Object.entries(counts).map(([x, y]) => ({ x, y }));
	}

	// Sort by value descending for funnel effect
	processedData.sort((a, b) => b.y - a.y);

	const labels = processedData.map(item => String(item.x));
	const data = processedData.map(item => item.y);

	return {
		labels,
		datasets: [
			{
				label: 'Funnel Data',
				data,
				backgroundColor: labels.map((_, index) => getColorFromScheme(colorScheme, index, 0.7)),
				borderColor: labels.map((_, index) => getColorFromScheme(colorScheme, index)),
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for treemap chart
 */
function generateTreemapData(template, fullData) {
	const { xAxis, yAxis, groupBy, aggregation = 'sum', colorScheme } = template;

	let hierarchicalData;

	if (groupBy && groupBy !== xAxis) {
		// Two-level hierarchy
		const grouped = {};
		fullData.forEach((row) => {
			const group = row[groupBy];
			const item = row[xAxis];
			const value = Number(row[yAxis]) || 0;

			if (!grouped[group]) grouped[group] = {};
			if (!grouped[group][item]) grouped[group][item] = 0;
			
			if (aggregation === 'sum') {
				grouped[group][item] += value;
			} else if (aggregation === 'count') {
				grouped[group][item] += 1;
			}
		});

		hierarchicalData = Object.entries(grouped).map(([group, items]) => ({
			label: String(group),
			value: Object.values(items).reduce((sum, val) => sum + val, 0),
			children: Object.entries(items).map(([item, value]) => ({
				label: String(item),
				value: value
			}))
		}));
	} else {
		// Single level
		const aggregatedData = aggregateData(fullData, xAxis, yAxis, aggregation);
		hierarchicalData = aggregatedData.map((item, index) => ({
			label: String(item.x),
			value: item.y,
			color: getColorFromScheme(colorScheme, index, 0.7)
		}));
	}

	return {
		datasets: [
			{
				label: 'Treemap Data',
				data: hierarchicalData,
				backgroundColor: function(context) {
					return context.dataset.data[context.dataIndex]?.color || 
						   getColorFromScheme(colorScheme, context.dataIndex, 0.7);
				},
				borderColor: getColorFromScheme(colorScheme, 0),
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for sunburst chart
 */
function generateSunburstData(template, fullData) {
	const { xAxis, yAxis, groupBy, aggregation = 'sum', colorScheme } = template;

	// Create hierarchical structure for sunburst
	const hierarchy = {};
	
	fullData.forEach((row) => {
		const category = row[groupBy] || 'Root';
		const subcategory = row[xAxis];
		const value = Number(row[yAxis]) || 1;

		if (!hierarchy[category]) {
			hierarchy[category] = { total: 0, children: {} };
		}
		
		if (!hierarchy[category].children[subcategory]) {
			hierarchy[category].children[subcategory] = 0;
		}

		if (aggregation === 'sum') {
			hierarchy[category].children[subcategory] += value;
			hierarchy[category].total += value;
		} else {
			hierarchy[category].children[subcategory] += 1;
			hierarchy[category].total += 1;
		}
	});

	const sunburstData = [];
	
	Object.entries(hierarchy).forEach(([category, data], categoryIndex) => {
		sunburstData.push({
			label: category,
			value: data.total,
			level: 0,
			color: getColorFromScheme(colorScheme, categoryIndex, 0.7)
		});

		Object.entries(data.children).forEach(([subcategory, value], subIndex) => {
			sunburstData.push({
				label: subcategory,
				value: value,
				level: 1,
				parent: category,
				color: getColorFromScheme(colorScheme, categoryIndex, 0.5 + (subIndex * 0.1))
			});
		});
	});

	return {
		datasets: [
			{
				label: 'Sunburst Data',
				data: sunburstData,
				backgroundColor: function(context) {
					return context.dataset.data[context.dataIndex]?.color || 
						   getColorFromScheme(colorScheme, context.dataIndex, 0.7);
				},
				borderColor: '#ffffff',
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for gauge chart
 */
function generateGaugeData(template, fullData) {
	const { yAxis, min = 0, max = 100, colorScheme } = template;

	// Calculate the current value (could be sum, average, etc.)
	const values = fullData
		.map(row => Number(row[yAxis]))
		.filter(val => !isNaN(val));

	const currentValue = values.length > 0 ? 
		values.reduce((sum, val) => sum + val, 0) / values.length : 0;

	// Calculate percentage for gauge
	const percentage = Math.min(Math.max((currentValue - min) / (max - min) * 100, 0), 100);

	return {
		datasets: [
			{
				label: yAxis,
				data: [percentage, 100 - percentage],
				backgroundColor: [
					getColorFromScheme(colorScheme, 0, 0.8),
					getColorFromScheme('gray', 0, 0.2)
				],
				borderColor: [
					getColorFromScheme(colorScheme, 0),
					getColorFromScheme('gray', 0)
				],
				borderWidth: 2,
				cutout: '70%',
				circumference: 180,
				rotation: 270,
				currentValue: currentValue,
				minValue: min,
				maxValue: max
			}
		]
	};
}

/**
 * Generate data for Sankey diagram
 */
function generateSankeyData(template, fullData) {
	// Map template fields to sankey-specific fields
	const sourceAxis = template.sourceAxis || template.xAxis;
	const targetAxis = template.targetAxis || template.yAxis;
	const valueAxis = template.valueAxis || template.sizeAxis || template.yAxis;
	const { colorScheme } = template;

	if (!sourceAxis || !targetAxis) {
		console.warn('Sankey chart requires sourceAxis/xAxis and targetAxis/yAxis');
		return { nodes: [], links: [] };
	}

	const nodes = new Set();
	const links = [];

	// Collect all unique nodes
	fullData.forEach(row => {
		if (row[sourceAxis]) nodes.add(String(row[sourceAxis]));
		if (row[targetAxis]) nodes.add(String(row[targetAxis]));
	});

	const nodeArray = Array.from(nodes);
	const nodeIndexMap = {};
	nodeArray.forEach((node, index) => {
		nodeIndexMap[node] = index;
	});

	// Create links
	const linkMap = {};
	fullData.forEach(row => {
		const source = String(row[sourceAxis]);
		const target = String(row[targetAxis]);
		const value = valueAxis ? (Number(row[valueAxis]) || 1) : 1;

		if (source && target && source !== target) {
			const linkKey = `${source}->${target}`;
			if (!linkMap[linkKey]) {
				linkMap[linkKey] = {
					source: nodeIndexMap[source],
					target: nodeIndexMap[target],
					value: 0
				};
			}
			linkMap[linkKey].value += value;
		}
	});

	return {
		nodes: nodeArray.map((node, index) => ({
			id: index,
			label: String(node),
			value: 0, // Will be calculated if needed
			color: getColorFromScheme(colorScheme, index, 0.7)
		})),
		links: Object.values(linkMap)
	};
}

/**
 * Generate data for candlestick chart
 */
function generateCandlestickData(template, fullData) {
	const { xAxis, openAxis, highAxis, lowAxis, closeAxis, colorScheme } = template;

	const candlestickData = fullData
		.filter(row => 
			row[xAxis] && 
			row[openAxis] !== null && 
			row[highAxis] !== null && 
			row[lowAxis] !== null && 
			row[closeAxis] !== null
		)
		.map(row => ({
			x: row[xAxis],
			o: Number(row[openAxis]),
			h: Number(row[highAxis]),
			l: Number(row[lowAxis]),
			c: Number(row[closeAxis])
		}))
		.sort((a, b) => new Date(a.x) - new Date(b.x));

	return {
		datasets: [
			{
				label: 'OHLC Data',
				data: candlestickData,
				borderColor: getColorFromScheme(colorScheme, 0),
				backgroundColor: function(context) {
					const point = context.dataset.data[context.dataIndex];
					return point.c >= point.o ? 
						getColorFromScheme('green', 0, 0.7) : 
						getColorFromScheme('red', 0, 0.7);
				},
				borderWidth: 1
			}
		]
	};
}

/**
 * Generate data for violin plot
 */
function generateViolinData(template, fullData) {
	const { xAxis, yAxis, groupBy, colorScheme } = template;

	if (groupBy) {
		const groups = [...new Set(fullData.map(row => row[groupBy]))];
		
		const datasets = groups.map((group, index) => {
			const groupValues = fullData
				.filter(row => row[groupBy] === group)
				.map(row => Number(row[yAxis]))
				.filter(val => !isNaN(val));

			// Calculate density distribution for violin shape
			const density = calculateDensity(groupValues);

			return {
				label: String(group),
				data: density,
				backgroundColor: getColorFromScheme(colorScheme, index, 0.6),
				borderColor: getColorFromScheme(colorScheme, index),
				borderWidth: 2
			};
		});

		return { labels: groups, datasets };
	} else {
		const values = fullData
			.map(row => Number(row[yAxis]))
			.filter(val => !isNaN(val));

		const density = calculateDensity(values);

		return {
			labels: [yAxis],
			datasets: [
				{
					label: yAxis,
					data: density,
					backgroundColor: getColorFromScheme(colorScheme, 0, 0.6),
					borderColor: getColorFromScheme(colorScheme, 0),
					borderWidth: 2
				}
			]
		};
	}
}

/**
 * Generate data for streamgraph
 */
function generateStreamgraphData(template, fullData) {
	const { xAxis, yAxis, groupBy, aggregation = 'sum', colorScheme } = template;

	if (!groupBy) {
		return generateAreaChartData(template, fullData);
	}

	const timePoints = [...new Set(fullData.map(row => row[xAxis]))].sort();
	const categories = [...new Set(fullData.map(row => row[groupBy]))];

	const datasets = categories.map((category, index) => {
		const categoryData = timePoints.map(timePoint => {
			const relevantRows = fullData.filter(
				row => row[xAxis] === timePoint && row[groupBy] === category
			);

			if (relevantRows.length === 0) return 0;

			if (aggregation === 'sum') {
				return relevantRows.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0);
			} else if (aggregation === 'avg') {
				const sum = relevantRows.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0);
				return sum / relevantRows.length;
			} else {
				return relevantRows.length;
			}
		});

		return {
			label: String(category),
			data: categoryData,
			backgroundColor: getColorFromScheme(colorScheme, index, 0.7),
			borderColor: getColorFromScheme(colorScheme, index),
			borderWidth: 1,
			fill: true,
			tension: 0.4
		};
	});

	return { labels: timePoints, datasets };
}

/**
 * Generate data for parallel coordinates chart
 */
function generateParallelCoordinatesData(template, fullData) {
	const { dimensions, colorScheme } = template;

	if (!dimensions || dimensions.length < 2) {
		throw new Error('Parallel coordinates requires at least 2 dimensions');
	}

	const normalizedData = fullData.map((row, index) => {
		const normalizedRow = { index };
		
		dimensions.forEach(dim => {
			const value = Number(row[dim]);
			normalizedRow[dim] = isNaN(value) ? 0 : value;
		});

		return normalizedRow;
	});

	// Calculate min/max for normalization
	const ranges = {};
	dimensions.forEach(dim => {
		const values = normalizedData.map(row => row[dim]).filter(val => !isNaN(val));
		ranges[dim] = {
			min: Math.min(...values),
			max: Math.max(...values)
		};
	});

	return {
		data: normalizedData,
		dimensions: dimensions,
		ranges: ranges,
		colorScheme: colorScheme
	};
}

/**
 * Generate data for Marimekko chart
 */
function generateMarimekkoData(template, fullData) {
	const { xAxis, yAxis, sizeAxis, colorScheme } = template;

	// Create matrix of data
	const xValues = [...new Set(fullData.map(row => row[xAxis]))];
	const yValues = [...new Set(fullData.map(row => row[yAxis]))];

	const matrix = [];
	let totalSize = 0;

	yValues.forEach((yVal, yIndex) => {
		const rowData = [];
		let rowTotal = 0;

		xValues.forEach((xVal, xIndex) => {
			const relevantRows = fullData.filter(
				row => row[xAxis] === xVal && row[yAxis] === yVal
			);

			const cellSize = relevantRows.reduce(
				(sum, row) => sum + (Number(row[sizeAxis]) || 0), 0
			);

			rowData.push({
				x: xVal,
				y: yVal,
				size: cellSize,
				xIndex,
				yIndex
			});

			rowTotal += cellSize;
		});

		matrix.push({
			category: yVal,
			data: rowData,
			total: rowTotal
		});

		totalSize += rowTotal;
	});

	// Calculate proportional widths and heights
	const processedData = [];
	
	matrix.forEach((row, rowIndex) => {
		const rowHeight = totalSize > 0 ? (row.total / totalSize) * 100 : 0;
		
		row.data.forEach((cell, cellIndex) => {
			const cellWidth = row.total > 0 ? (cell.size / row.total) * 100 : 0;
			
			processedData.push({
				x: cell.xIndex,
				y: rowIndex,
				width: cellWidth,
				height: rowHeight,
				value: cell.size,
				xLabel: cell.x,
				yLabel: cell.y,
				color: getColorFromScheme(colorScheme, cellIndex, 0.7)
			});
		});
	});

	return {
		labels: {
			x: xValues,
			y: yValues
		},
		data: processedData
	};
}

/**
 * Helper function to calculate density for violin plots
 */
function calculateDensity(values) {
	if (values.length === 0) return [];

	values.sort((a, b) => a - b);
	const min = values[0];
	const max = values[values.length - 1];
	const range = max - min;
	const bandwidth = range / 20; // Simple bandwidth estimation

	const density = [];
	const steps = 50;

	for (let i = 0; i <= steps; i++) {
		const x = min + (range * i / steps);
		let y = 0;

		values.forEach(value => {
			const distance = Math.abs(x - value);
			if (distance <= bandwidth) {
				// Gaussian kernel
				y += Math.exp(-0.5 * Math.pow(distance / bandwidth, 2));
			}
		});

		density.push({ x, y: y / (values.length * bandwidth * Math.sqrt(2 * Math.PI)) });
	}

	return density;
}

/**
 * Generate data for network diagram
 */
function generateNetworkData(template, fullData) {
	const { sourceAxis, targetAxis, valueAxis, colorScheme } = template;

	const nodes = new Set();
	const links = [];

	// Collect nodes and links
	fullData.forEach(row => {
		const source = row[sourceAxis];
		const target = row[targetAxis];
		const value = Number(row[valueAxis]) || 1;

		if (source && target) {
			nodes.add(source);
			nodes.add(target);
			
			links.push({
				source: source,
				target: target,
				value: value
			});
		}
	});

	const nodeArray = Array.from(nodes).map((node, index) => ({
		id: node,
		label: String(node),
		value: links.filter(link => link.source === node || link.target === node)
			.reduce((sum, link) => sum + link.value, 0),
		color: getColorFromScheme(colorScheme, index, 0.7)
	}));

	return {
		nodes: nodeArray,
		links: links.map(link => ({
			...link,
			color: getColorFromScheme(colorScheme, 0, 0.5)
		}))
	};
}

/**
 * Generate data for chord diagram
 */
function generateChordData(template, fullData) {
	const { sourceAxis, targetAxis, valueAxis, colorScheme } = template;

	const entities = new Set();
	fullData.forEach(row => {
		if (row[sourceAxis]) entities.add(row[sourceAxis]);
		if (row[targetAxis]) entities.add(row[targetAxis]);
	});

	const entityArray = Array.from(entities);
	const matrix = entityArray.map(() => entityArray.map(() => 0));

	// Fill the adjacency matrix
	fullData.forEach(row => {
		const source = row[sourceAxis];
		const target = row[targetAxis];
		const value = Number(row[valueAxis]) || 1;

		if (source && target) {
			const sourceIndex = entityArray.indexOf(source);
			const targetIndex = entityArray.indexOf(target);
			
			if (sourceIndex !== -1 && targetIndex !== -1) {
				matrix[sourceIndex][targetIndex] += value;
			}
		}
	});

	return {
		labels: entityArray,
		matrix: matrix,
		colors: entityArray.map((_, index) => getColorFromScheme(colorScheme, index, 0.7))
	};
}

/**
 * Generate data for alluvial diagram
 */
function generateAlluvialData(template, fullData) {
	const { stages, valueAxis, colorScheme } = template;

	if (!stages || stages.length < 2) {
		throw new Error('Alluvial diagram requires at least 2 stages');
	}

	const flows = {};
	
	fullData.forEach(row => {
		const value = Number(row[valueAxis]) || 1;
		const path = stages.map(stage => row[stage]).join(' -> ');
		
		if (!flows[path]) {
			flows[path] = {
				stages: stages.map(stage => row[stage]),
				value: 0
			};
		}
		flows[path].value += value;
	});

	// Convert to nodes and links format
	const nodes = new Set();
	const links = [];

	Object.values(flows).forEach(flow => {
		flow.stages.forEach((stage, index) => {
			if (stage) {
				nodes.add(`${stage}_${index}`);
			}
		});

		for (let i = 0; i < flow.stages.length - 1; i++) {
			if (flow.stages[i] && flow.stages[i + 1]) {
				links.push({
					source: `${flow.stages[i]}_${i}`,
					target: `${flow.stages[i + 1]}_${i + 1}`,
					value: flow.value
				});
			}
		}
	});

	return {
		nodes: Array.from(nodes).map((node, index) => ({
			id: node,
			label: node.split('_')[0],
			stage: parseInt(node.split('_')[1]),
			color: getColorFromScheme(colorScheme, index, 0.7)
		})),
		links: links
	};
}

/**
 * Generate data for radial bar chart
 */
function generateRadialBarData(template, fullData) {
	const { xAxis, yAxis, aggregation, colorScheme } = template;

	let processedData;
	if (aggregation && aggregation !== 'none') {
		processedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		const counts = {};
		fullData.forEach((row) => {
			const key = row[xAxis];
			if (key !== null && key !== undefined) {
				counts[key] = (counts[key] || 0) + (Number(row[yAxis]) || 1);
			}
		});
		processedData = Object.entries(counts).map(([x, y]) => ({ x, y }));
	}

	const labels = processedData.map(item => String(item.x));
	const data = processedData.map(item => item.y);

	return {
		labels,
		datasets: [
			{
				label: yAxis,
				data,
				backgroundColor: labels.map((_, index) => getColorFromScheme(colorScheme, index, 0.7)),
				borderColor: labels.map((_, index) => getColorFromScheme(colorScheme, index)),
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for calendar heatmap
 */
function generateCalendarData(template, fullData) {
	const { dateAxis, valueAxis, aggregation = 'sum', colorScheme } = template;

	const dateValueMap = {};
	
	fullData.forEach(row => {
		const date = new Date(row[dateAxis]);
		if (!isNaN(date.getTime())) {
			const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
			const value = Number(row[valueAxis]) || 0;
			
			if (!dateValueMap[dateKey]) {
				dateValueMap[dateKey] = [];
			}
			dateValueMap[dateKey].push(value);
		}
	});

	// Aggregate values for each date
	const calendarData = Object.entries(dateValueMap).map(([date, values]) => {
		let aggregatedValue;
		
		if (aggregation === 'sum') {
			aggregatedValue = values.reduce((sum, val) => sum + val, 0);
		} else if (aggregation === 'avg') {
			aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
		} else if (aggregation === 'count') {
			aggregatedValue = values.length;
		} else {
			aggregatedValue = values[0];
		}

		return {
			date: date,
			value: aggregatedValue
		};
	});

	// Calculate intensity for color mapping
	const maxValue = Math.max(...calendarData.map(d => d.value));
	
	return {
		data: calendarData.map(item => ({
			...item,
			intensity: maxValue > 0 ? item.value / maxValue : 0,
			color: getColorFromScheme(colorScheme, 0, item.value / maxValue)
		})),
		maxValue: maxValue
	};
}

/**
 * Generate data for slope chart
 */
function generateSlopeData(template, fullData) {
	const { xAxis, yAxis, groupBy, colorScheme } = template;

	if (!groupBy) {
		throw new Error('Slope chart requires a groupBy field');
	}

	const timePoints = [...new Set(fullData.map(row => row[xAxis]))].sort();
	if (timePoints.length !== 2) {
		throw new Error('Slope chart requires exactly 2 time points');
	}

	const groups = [...new Set(fullData.map(row => row[groupBy]))];

	const slopeData = groups.map((group, index) => {
		const startValue = fullData
			.filter(row => row[groupBy] === group && row[xAxis] === timePoints[0])
			.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0);

		const endValue = fullData
			.filter(row => row[groupBy] === group && row[xAxis] === timePoints[1])
			.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0);

		return {
			label: String(group),
			data: [startValue, endValue],
			borderColor: getColorFromScheme(colorScheme, index),
			backgroundColor: getColorFromScheme(colorScheme, index, 0.1),
			tension: 0,
			pointRadius: 6,
			pointHoverRadius: 8
		};
	});

	return {
		labels: timePoints,
		datasets: slopeData
	};
}

/**
 * Generate data for ridgeline plot
 */
function generateRidgelineData(template, fullData) {
	const { xAxis, yAxis, groupBy, colorScheme } = template;

	if (!groupBy) {
		throw new Error('Ridgeline plot requires a groupBy field');
	}

	const groups = [...new Set(fullData.map(row => row[groupBy]))];
	
	const ridgelineData = groups.map((group, index) => {
		const groupValues = fullData
			.filter(row => row[groupBy] === group)
			.map(row => Number(row[yAxis]))
			.filter(val => !isNaN(val));

		const density = calculateDensity(groupValues);
		
		// Offset each ridge by its index for stacking effect
		const offsetDensity = density.map(point => ({
			...point,
			y: point.y + (index * 2) // Offset by group index
		}));

		return {
			label: String(group),
			data: offsetDensity,
			backgroundColor: getColorFromScheme(colorScheme, index, 0.6),
			borderColor: getColorFromScheme(colorScheme, index),
			borderWidth: 2,
			fill: true
		};
	});

	return {
		datasets: ridgelineData
	};
}

/**
 * Generate data for word cloud
 */
function generateWordCloudData(template, fullData) {
	const { textAxis, valueAxis, colorScheme } = template;

	const wordCounts = {};
	
	fullData.forEach(row => {
		const text = String(row[textAxis] || '').toLowerCase();
		const value = Number(row[valueAxis]) || 1;
		
		// Simple word extraction (split by spaces and remove punctuation)
		const words = text.match(/\b\w+\b/g) || [];
		
		words.forEach(word => {
			if (word.length > 2) { // Filter out very short words
				if (!wordCounts[word]) {
					wordCounts[word] = 0;
				}
				wordCounts[word] += value;
			}
		});
	});

	// Convert to array and sort by frequency
	const wordData = Object.entries(wordCounts)
		.map(([word, count]) => ({ text: word, value: count }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 100); // Limit to top 100 words

	const maxValue = Math.max(...wordData.map(w => w.value));

	return {
		words: wordData.map((word, index) => ({
			...word,
			size: Math.max(10, (word.value / maxValue) * 50), // Scale font size
			color: getColorFromScheme(colorScheme, index % 10, 0.8)
		}))
	};
}

/**
 * Generate data for dendrogram
 */
function generateDendogramData(template, fullData) {
	const { features, labelAxis, colorScheme } = template;

	if (!features || features.length < 2) {
		throw new Error('Dendrogram requires at least 2 features for clustering');
	}

	// Extract feature vectors
	const dataPoints = fullData.map(row => ({
		label: row[labelAxis] || 'Unknown',
		features: features.map(feature => Number(row[feature]) || 0),
		original: row
	}));

	// Simple hierarchical clustering (single linkage)
	const clusters = dataPoints.map((point, index) => ({
		id: index,
		label: point.label,
		children: [],
		height: 0,
		data: point
	}));

	// Calculate distance matrix
	const distances = [];
	for (let i = 0; i < dataPoints.length; i++) {
		distances[i] = [];
		for (let j = 0; j < dataPoints.length; j++) {
			if (i === j) {
				distances[i][j] = 0;
			} else {
				// Euclidean distance
				const dist = Math.sqrt(
					dataPoints[i].features.reduce((sum, val, idx) => 
						sum + Math.pow(val - dataPoints[j].features[idx], 2), 0
					)
				);
				distances[i][j] = dist;
			}
		}
	}

	return {
		nodes: clusters.map((cluster, index) => ({
			...cluster,
			color: getColorFromScheme(colorScheme, index, 0.7)
		})),
		distances: distances
	};
}

/**
 * Generate data for step chart
 */
function generateStepData(template, fullData) {
	const baseData = generateXYChartData(template, fullData);
	
	// Modify datasets to use stepped line
	baseData.datasets = baseData.datasets.map(dataset => ({
		...dataset,
		stepped: 'before', // or 'after' or 'middle'
		tension: 0
	}));

	return baseData;
}

/**
 * Generate data for area spline chart
 */
function generateAreaSplineData(template, fullData) {
	const baseData = generateAreaChartData(template, fullData);
	
	// Add spline smoothing
	baseData.datasets = baseData.datasets.map(dataset => ({
		...dataset,
		tension: 0.6, // Higher tension for smoother splines
		cubicInterpolationMode: 'monotone'
	}));

	return baseData;
}

/**
 * Generate data for radial column chart
 */
function generateRadialColumnData(template, fullData) {
	const { xAxis, yAxis, aggregation, colorScheme } = template;

	let processedData;
	if (aggregation && aggregation !== 'none') {
		processedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		const counts = {};
		fullData.forEach((row) => {
			const key = row[xAxis];
			if (key !== null && key !== undefined) {
				counts[key] = (counts[key] || 0) + (Number(row[yAxis]) || 1);
			}
		});
		processedData = Object.entries(counts).map(([x, y]) => ({ x, y }));
	}

	const labels = processedData.map(item => String(item.x));
	const data = processedData.map(item => item.y);

	return {
		labels,
		datasets: [
			{
				label: yAxis,
				data,
				backgroundColor: labels.map((_, index) => getColorFromScheme(colorScheme, index, 0.7)),
				borderColor: labels.map((_, index) => getColorFromScheme(colorScheme, index)),
				borderWidth: 2
			}
		]
	};
}

/**
 * Generate data for spider/radar variant chart
 */
function generateSpiderData(template, fullData) {
	// Spider chart is essentially the same as radar chart
	return generateRadarData(template, fullData);
}

/**
 * Generate data for bullet chart
 */
function generateBulletData(template, fullData) {
	const { valueAxis, targetAxis, rangeAxis, colorScheme } = template;

	const bulletData = fullData.map((row, index) => {
		const value = Number(row[valueAxis]) || 0;
		const target = Number(row[targetAxis]) || 0;
		const range = Number(row[rangeAxis]) || Math.max(value, target) * 1.2;

		return {
			label: row[template.labelAxis] || `Item ${index + 1}`,
			value: value,
			target: target,
			range: range,
			color: getColorFromScheme(colorScheme, index, 0.7)
		};
	});

	return {
		data: bulletData
	};
}

/**
 * Generate data for Gantt chart
 */
function generateGanttData(template, fullData) {
	const { taskAxis, startDateAxis, endDateAxis, categoryAxis, colorScheme } = template;

	const ganttData = fullData.map((row, index) => {
		const startDate = new Date(row[startDateAxis]);
		const endDate = new Date(row[endDateAxis]);
		const duration = endDate.getTime() - startDate.getTime();

		return {
			task: row[taskAxis],
			start: startDate,
			end: endDate,
			duration: duration,
			category: row[categoryAxis] || 'Default',
			color: getColorFromScheme(colorScheme, index, 0.7)
		};
	});

	// Group by category if specified
	const categories = [...new Set(ganttData.map(item => item.category))];
	
	return {
		tasks: ganttData,
		categories: categories,
		timeline: {
			start: new Date(Math.min(...ganttData.map(item => item.start.getTime()))),
			end: new Date(Math.max(...ganttData.map(item => item.end.getTime())))
		}
	};
}

/**
 * Generate data for pictogram chart
 */
function generatePictogramData(template, fullData) {
	const { xAxis, yAxis, aggregation = 'sum', iconValue = 1, colorScheme } = template;

	let processedData;
	if (aggregation && aggregation !== 'none') {
		processedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		const counts = {};
		fullData.forEach((row) => {
			const key = row[xAxis];
			if (key !== null && key !== undefined) {
				counts[key] = (counts[key] || 0) + (Number(row[yAxis]) || 1);
			}
		});
		processedData = Object.entries(counts).map(([x, y]) => ({ x, y }));
	}

	const pictogramData = processedData.map((item, index) => ({
		label: String(item.x),
		value: item.y,
		iconCount: Math.ceil(item.y / iconValue),
		fullIcons: Math.floor(item.y / iconValue),
		partialIcon: (item.y % iconValue) / iconValue,
		color: getColorFromScheme(colorScheme, index, 0.7)
	}));

	return {
		data: pictogramData,
		iconValue: iconValue
	};
}

/**
 * Generate data for dot plot
 */
function generateDotPlotData(template, fullData) {
	const { xAxis, yAxis, groupBy, colorScheme } = template;

	if (groupBy && groupBy !== xAxis) {
		const groups = [...new Set(fullData.map(row => row[groupBy]))];
		const categories = [...new Set(fullData.map(row => row[xAxis]))];

		const datasets = groups.map((group, index) => {
			const groupData = categories.map(category => {
				const relevantRows = fullData.filter(
					row => row[xAxis] === category && row[groupBy] === group
				);
				
				return relevantRows.length > 0 ? 
					relevantRows.reduce((sum, row) => sum + (Number(row[yAxis]) || 0), 0) / relevantRows.length : 0;
			});

			return {
				label: String(group),
				data: groupData,
				backgroundColor: getColorFromScheme(colorScheme, index, 0.8),
				borderColor: getColorFromScheme(colorScheme, index),
				borderWidth: 2,
				pointRadius: 6,
				pointHoverRadius: 8,
				showLine: false
			};
		});

		return { labels: categories, datasets };
	} else {
		const aggregatedData = aggregateData(fullData, xAxis, yAxis, 'avg');
		
		return {
			labels: aggregatedData.map(item => String(item.x)),
			datasets: [
				{
					label: yAxis,
					data: aggregatedData.map(item => item.y),
					backgroundColor: getColorFromScheme(colorScheme, 0, 0.8),
					borderColor: getColorFromScheme(colorScheme, 0),
					borderWidth: 2,
					pointRadius: 6,
					pointHoverRadius: 8,
					showLine: false
				}
			]
		};
	}
}

/**
 * Generate data for lollipop chart
 */
function generateLollipopData(template, fullData) {
	const { xAxis, yAxis, aggregation, colorScheme } = template;

	let processedData;
	if (aggregation && aggregation !== 'none') {
		processedData = aggregateData(fullData, xAxis, yAxis, aggregation);
	} else {
		processedData = fullData
			.map((row) => ({ x: row[xAxis], y: row[yAxis] }))
			.filter((point) => point.x !== null && point.y !== null);
	}

	const labels = processedData.map(item => String(item.x));
	const data = processedData.map(item => item.y);

	// Create stem (line) and head (point) datasets
	return {
		labels,
		datasets: [
			{
				label: `${yAxis} (Stem)`,
				type: 'line',
				data: data,
				borderColor: getColorFromScheme(colorScheme, 0),
				backgroundColor: 'transparent',
				borderWidth: 3,
				pointRadius: 0,
				tension: 0
			},
			{
				label: `${yAxis} (Head)`,
				type: 'scatter',
				data: data,
				backgroundColor: getColorFromScheme(colorScheme, 0, 0.8),
				borderColor: getColorFromScheme(colorScheme, 0),
				borderWidth: 2,
				pointRadius: 8,
				pointHoverRadius: 10
			}
		]
	};
}

/**
 * Generate data for bump chart
 */
function generateBumpData(template, fullData) {
	const { xAxis, yAxis, groupBy, colorScheme } = template;

	if (!groupBy) {
		throw new Error('Bump chart requires a groupBy field');
	}

	const timePoints = [...new Set(fullData.map(row => row[xAxis]))].sort();
	const entities = [...new Set(fullData.map(row => row[groupBy]))];

	// Calculate rankings for each time point
	const rankings = {};
	
	timePoints.forEach(timePoint => {
		const timeData = fullData
			.filter(row => row[xAxis] === timePoint)
			.map(row => ({
				entity: row[groupBy],
				value: Number(row[yAxis]) || 0
			}))
			.sort((a, b) => b.value - a.value); // Sort descending

		rankings[timePoint] = {};
		timeData.forEach((item, index) => {
			rankings[timePoint][item.entity] = index + 1; // Rank starts from 1
		});
	});

	const datasets = entities.map((entity, index) => {
		const entityData = timePoints.map(timePoint => 
			rankings[timePoint][entity] || entities.length + 1
		);

		return {
			label: String(entity),
			data: entityData,
			borderColor: getColorFromScheme(colorScheme, index),
			backgroundColor: getColorFromScheme(colorScheme, index, 0.2),
			borderWidth: 3,
			tension: 0.2,
			pointRadius: 6,
			pointHoverRadius: 8
		};
	});

	return {
		labels: timePoints,
		datasets: datasets
	};
}

/**
 * Aggregate data based on grouping and aggregation function
 * @param {Array} data - Raw data array
 * @param {string} xAxis - X-axis column name
 * @param {string} yAxis - Y-axis column name  
 * @param {string} aggregation - Aggregation method (sum, avg, count, min, max)
 * @param {string} groupBy - Optional grouping column
 * @returns {Array} Aggregated data
 */
function aggregateData(data, xAxis, yAxis, aggregation, groupBy = null) {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return [];
	}

	const groupKey = groupBy || '__single_group__';
	const groups = {};

	// Group data
	data.forEach(row => {
		const xValue = row[xAxis];
		const yValue = Number(row[yAxis]) || 0;
		const groupValue = groupBy ? row[groupBy] : '__single_group__';

		const key = `${xValue}_${groupValue}`;

		if (!groups[key]) {
			groups[key] = {
				x: xValue,
				group: groupValue,
				values: [],
				count: 0
			};
		}

		if (!isNaN(yValue)) {
			groups[key].values.push(yValue);
		}
		groups[key].count++;
	});

	// Apply aggregation
	const result = Object.values(groups).map(group => {
		let aggregatedValue = 0;

		switch (aggregation) {
			case 'sum':
				aggregatedValue = group.values.reduce((sum, val) => sum + val, 0);
				break;
			case 'avg':
			case 'average':
				aggregatedValue = group.values.length > 0 
					? group.values.reduce((sum, val) => sum + val, 0) / group.values.length 
					: 0;
				break;
			case 'count':
				aggregatedValue = group.count;
				break;
			case 'min':
				aggregatedValue = group.values.length > 0 ? Math.min(...group.values) : 0;
				break;
			case 'max':
				aggregatedValue = group.values.length > 0 ? Math.max(...group.values) : 0;
				break;
			case 'none':
			default:
				aggregatedValue = group.values.length > 0 ? group.values[0] : 0;
				break;
		}

		return {
			x: group.x,
			y: aggregatedValue,
			group: group.group,
			count: group.count
		};
	});

	return result;
}

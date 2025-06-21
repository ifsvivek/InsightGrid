import { json } from '@sveltejs/kit';
import { GROQ_API_KEY } from '$env/static/private';
import { ChatGroq } from '@langchain/groq';
import Papa from 'papaparse';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || typeof file === 'string') {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		// Parse CSV
		const csvText = await file.text();
		const parsedData = Papa.parse(csvText, {
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true
		});

		if (parsedData.errors.length > 0) {
			return json({ error: 'Invalid CSV format' }, { status: 400 });
		}

		const { data: rows, meta } = parsedData;
		
		// Optimize data processing for large datasets
		const MAX_CHART_DATA_POINTS = 2000; // Limit chart data for performance
		const sampleData = rows.slice(0, 15); // First 15 rows for analysis
		
		// For chart rendering, use optimized dataset
		let chartData = rows;
		if (rows.length > MAX_CHART_DATA_POINTS) {
			// Sample data for better performance
			const sampleRatio = MAX_CHART_DATA_POINTS / rows.length;
			chartData = rows.filter((_, index) => index % Math.ceil(1 / sampleRatio) === 0);
			console.log(`Large dataset detected (${rows.length} rows), sampling to ${chartData.length} rows for charts`);
		}
		
		const limitedCsvText = Papa.unparse(sampleData); // Convert back to CSV with limited rows

		// Initialize AI models with different Groq models for different tasks
		const orchestratorModel = new ChatGroq({
			apiKey: GROQ_API_KEY,
			model: 'llama3-70b-8192', // Most capable for strategy
			temperature: 0.2
		});

		const chartModel = new ChatGroq({
			apiKey: GROQ_API_KEY,
			model: 'llama-3.1-8b-instant', // Fast for chart templates
			temperature: 0.1
		});

		const dataModel = new ChatGroq({
			apiKey: GROQ_API_KEY,
			model: 'llama-3.1-8b-instant', // Good for data analysis
			temperature: 0.3
		});

		const insightModel = new ChatGroq({
			apiKey: GROQ_API_KEY,
			model: 'llama3-70b-8192', // Best for insights
			temperature: 0.4
		});

		// Run multi-agent analysis focused on chart generation
		const insights = await runAgentPipeline(
			sampleData,
			meta.fields,
			orchestratorModel,
			chartModel,
			dataModel,
			insightModel
		);

		return json({
			success: true,
			fileName: file.name,
			rowCount: rows.length,
			columnCount: meta.fields?.length || 0,
			columns: meta.fields || [],
			sampleData,
			fullData: chartData, // Use optimized dataset for chart rendering
			isDataSampled: chartData.length < rows.length,
			originalRowCount: rows.length,
			chartDataRowCount: chartData.length,
			insights
		});
	} catch (error) {
		console.error('CSV Analysis Error:', error);
		return json({ error: 'Failed to analyze CSV' }, { status: 500 });
	}
}

async function runAgentPipeline(
	sampleData,
	columns,
	orchestratorModel,
	chartModel,
	dataModel,
	insightModel
) {
	// Use Groq orchestrator to determine analysis strategy
	const orchestratorResult = await orchestratorAgent(sampleData, columns, orchestratorModel);

	// Run agents in parallel for efficiency - all focused on chart generation
	const [dataAnalysis, schemaAnalysis, chartTemplates, basicInsights] = await Promise.all([
		dataCleanerAgent(sampleData, columns, dataModel),
		schemaAgent(sampleData, columns, dataModel),
		chartAgent(sampleData, columns, chartModel), // Primary focus
		insightAgent(sampleData, columns, insightModel) // Brief insights only
	]);

	return {
		orchestrator: orchestratorResult,
		dataCleanerAgent: dataAnalysis,
		schemaAgent: schemaAnalysis,
		chartAgent: chartTemplates,
		insightAgent: basicInsights
	};
}

async function dataCleanerAgent(sampleData, columns, model) {
	const prompt = `As a Data Cleaning Agent, analyze this CSV sample data and identify data quality issues:

Columns: ${columns.join(', ')}

Sample Data:
${JSON.stringify(sampleData, null, 2)}

Identify and suggest fixes for:
1. Missing values and nulls
2. Data type inconsistencies  
3. Formatting issues
4. Outliers or anomalies

Provide specific recommendations in JSON format.`;

	try {
		const response = await model.invoke(prompt);
		return {
			agent: 'DataCleanerAgent',
			recommendations: response.content,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		return { agent: 'DataCleanerAgent', error: error.message };
	}
}

async function schemaAgent(sampleData, columns, model) {
	const prompt = `As a Schema Analysis Agent, analyze this CSV data and classify each column:

Columns: ${columns.join(', ')}

Sample Data:
${JSON.stringify(sampleData, null, 2)}

For each column, determine:
1. Data type (string, number, date, boolean, categorical)
2. Statistical properties (min, max, unique values)
3. Business meaning and category
4. Relationships between columns

Return analysis in structured JSON format.`;

	try {
		const response = await model.invoke(prompt);
		return {
			agent: 'SchemaAgent',
			analysis: response.content,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		return { agent: 'SchemaAgent', error: error.message };
	}
}

async function chartAgent(sampleData, columns, model) {
	const prompt = `You are a Chart Template Generator. Analyze this sample data (15 rows) and create chart templates for the FULL dataset.

Columns: ${columns.join(', ')}

Sample Data (first 5 rows):
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Based on the sample data structure, generate 4-12 chart templates that will work with the complete dataset. 

Provide a diverse mix of chart types that tell different stories about the data:
- Start with 2-3 basic charts (bar, line, pie, scatter) for foundational analysis
- Add 4-6 advanced charts (heatmap, treemap, violin, parallel, network) for deeper insights
- Include 2-3 specialized charts (bullet, waterfall, sankey, chord) for unique perspectives
- Consider chart variants like horizontalBar vs bar, doughnut vs pie, area vs line for variety

Return ONLY a valid JSON array with this exact structure:

[
  {
    "id": "chart_1",
    "title": "Clear Chart Title",
    "description": "What this chart shows",
    "chartType": "CHART_TYPE_FROM_LIST_BELOW",
    "xAxis": "column_name_for_x_axis",
    "yAxis": "column_name_for_y_axis", 
    "yAxis2": "column_for_secondary_axis_if_mixed_chart",
    "sizeAxis": "column_for_bubble_size_if_bubble_chart",
    "valueAxis": "column_for_heatmap_values_if_heatmap",
    "groupBy": null,
    "aggregation": "sum|count|avg|none",
    "colorScheme": "blue|green|red|purple|orange|teal|pink|indigo|rainbow|pastel|dark|warm|cool",
    "bins": 10,
    "priority": 1
  }
]

## AVAILABLE CHART TYPES:

### Basic Charts:
- **line**: Time series, trends over time
- **bar**: Categorical comparisons, rankings  
- **horizontalBar**: Horizontal categorical comparisons
- **area**: Filled time series, cumulative trends
- **pie**: Part-to-whole relationships, compositions
- **doughnut**: Similar to pie with center hole
- **polarArea**: Pie alternative, better for magnitude comparison
- **radar**: Multi-dimensional profiles, comparisons
- **scatter**: Correlations between two numeric variables
- **bubble**: Three-dimensional relationships (x, y, size)

### Advanced Charts:
- **mixed**: Combine different chart types (bar + line)
- **histogram**: Distribution of single numeric variable
- **boxplot**: Statistical distribution, quartiles, outliers
- **heatmap**: Two-dimensional correlations, intensity maps

### Specialized Charts:
- **waterfall**: Sequential positive/negative changes
- **funnel**: Process stages with decreasing values
- **gauge**: Single KPI indicator with targets
- **bullet**: Performance vs target comparison
- **slope**: Change between two time points
- **bump**: Ranking changes over time
- **step**: Stepped line chart
- **area-spline**: Smooth area chart
- **lollipop**: Bar chart with circular endpoints
- **dot-plot**: Cleveland dot plot for comparisons

### Network & Flow Charts:
- **sankey**: Flow between nodes and stages
- **network**: Node-link network visualization
- **chord**: Circular relationship matrix
- **alluvial**: Multi-stage flow diagram
- **parallel**: Multi-dimensional parallel coordinates

### Hierarchical Charts:
- **treemap**: Nested rectangles for hierarchical data
- **sunburst**: Radial hierarchical visualization
- **dendogram**: Clustering tree diagram

### Statistical Charts:
- **violin**: Distribution shape visualization
- **ridgeline**: Multiple stacked density curves
- **candlestick**: Financial OHLC data
- **streamgraph**: Flowing stacked area chart

### Business Charts:
- **gantt**: Project timeline with tasks
- **marimekko**: Two-dimensional proportional chart
- **pictogram**: Icon-based data representation

### Special Purpose:
- **calendar**: Time-based heatmap calendar
- **wordcloud**: Text frequency visualization
- **radialBar**: Circular bar chart
- **radial-column**: Circular column chart
- **spider**: Alias for radar chart

Chart Selection Guidelines:
- **Time series data**: line, area, area-spline, step, slope, bump
- **Categorical comparisons**: bar, horizontalBar, lollipop, dot-plot
- **Compositions**: pie, doughnut, polarArea, treemap, sunburst
- **Distributions**: histogram, boxplot, violin, ridgeline
- **Correlations**: scatter, bubble, heatmap, parallel
- **Rankings/Performance**: bullet, waterfall, bump, slope
- **Processes/Flows**: funnel, sankey, alluvial, gantt
- **Networks**: network, chord, dendogram
- **Multi-dimensional**: radar, spider, parallel, marimekko
- **Financial data**: candlestick, waterfall, gauge
- **Geographic/Calendar**: calendar, heatmap
- **Text data**: wordcloud, pictogram

Rules:
- Generate 4-12 diverse charts that complement each other
- Start with foundational charts (bar, line, scatter, pie) then add advanced ones
- Use chart variants for variety (horizontalBar vs bar, doughnut vs pie, area vs line, etc.)
- Choose chart types that make sense for the data types and relationships
- Consider the story you want to tell with the data
- Use advanced charts when they provide better insights than basic ones
- For business data: consider bullet, gantt, waterfall, funnel charts
- For scientific data: consider violin, dendogram, parallel coordinates
- For network data: consider sankey, chord, alluvial charts
- Minimum 4 charts per response, maximum 12
- Focus on the most valuable and diverse insights
- Return ONLY the JSON array, no extra text or markdown
- Ensure all column names match exactly: ${columns.join(', ')}`;

	try {
		const response = await model.invoke(prompt);
		let content = response.content.trim();

		// More aggressive cleaning of response
		if (content.includes('```json')) {
			content = content.replace(/```json\n?/g, '').replace(/```/g, '');
		}
		if (content.includes('```')) {
			content = content.replace(/```[\s\S]*?\n/g, '').replace(/```\s*$/g, '');
		}

		// Remove any text before the JSON array
		const arrayMatch = content.match(/\[[\s\S]*\]/);
		if (arrayMatch) {
			content = arrayMatch[0];
		}

		// Validate JSON before returning
		try {
			const parsed = JSON.parse(content);
			if (!Array.isArray(parsed)) {
				throw new Error('Response is not a JSON array');
			}

			return {
				agent: 'ChartAgent',
				templates: content,
				timestamp: new Date().toISOString()
			};
		} catch (parseError) {
			console.error('JSON parsing failed:', parseError);
			console.error('Raw content:', content);

			// Return fallback templates based on column analysis
			const fallbackTemplates = generateFallbackTemplates(columns, sampleData);
			return {
				agent: 'ChartAgent',
				templates: JSON.stringify(fallbackTemplates),
				timestamp: new Date().toISOString(),
				fallback: true
			};
		}
	} catch (error) {
		console.error('Chart Agent Error:', error);

		// Generate fallback templates
		const fallbackTemplates = generateFallbackTemplates(columns, sampleData);
		return {
			agent: 'ChartAgent',
			error: error.message,
			templates: JSON.stringify(fallbackTemplates),
			fallback: true
		};
	}
}

function generateFallbackTemplates(columns, sampleData) {
	const templates = [];
	let chartId = 1;

	// Find numeric and categorical columns
	const numericColumns = [];
	const categoricalColumns = [];
	const dateColumns = [];

	columns.forEach((col) => {
		const sampleValues = sampleData
			.slice(0, 5)
			.map((row) => row[col])
			.filter((val) => val != null);

		if (sampleValues.some((val) => !isNaN(Date.parse(val)) && isNaN(val))) {
			dateColumns.push(col);
		} else if (sampleValues.every((val) => typeof val === 'number' || !isNaN(parseFloat(val)))) {
			numericColumns.push(col);
		} else {
			categoricalColumns.push(col);
		}
	});

	// Create diverse chart templates including advanced types
	if (numericColumns.length >= 2) {
		// Scatter plot for correlation
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} vs ${numericColumns[1]}`,
			description: `Correlation analysis between ${numericColumns[0]} and ${numericColumns[1]}`,
			chartType: 'scatter',
			xAxis: numericColumns[0],
			yAxis: numericColumns[1],
			groupBy: null,
			aggregation: 'none',
			colorScheme: 'blue',
			priority: 1
		});

		// Violin plot for distribution (advanced)
		templates.push({
			id: `chart_${chartId++}`,
			title: `Distribution of ${numericColumns[0]}`,
			description: `Statistical distribution and density of ${numericColumns[0]}`,
			chartType: 'violin',
			xAxis: numericColumns[0],
			yAxis: null,
			groupBy: categoricalColumns[0] || null,
			aggregation: 'none',
			colorScheme: 'green',
			priority: 2
		});
	}

	if (categoricalColumns.length > 0 && numericColumns.length > 0) {
		// Lollipop chart for categorical comparison (advanced)
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
			description: `Comparison of ${numericColumns[0]} across ${categoricalColumns[0]} categories`,
			chartType: 'lollipop',
			xAxis: categoricalColumns[0],
			yAxis: numericColumns[0],
			groupBy: null,
			aggregation: 'sum',
			colorScheme: 'purple',
			priority: 3
		});

		// Treemap for hierarchical view (advanced)
		if (categoricalColumns.length >= 1) {
			templates.push({
				id: `chart_${chartId++}`,
				title: `${categoricalColumns[0]} Composition`,
				description: `Hierarchical view of ${categoricalColumns[0]} with proportional sizing`,
				chartType: 'treemap',
				xAxis: categoricalColumns[0],
				yAxis: numericColumns[0],
				groupBy: categoricalColumns[1] || null,
				aggregation: 'sum',
				colorScheme: 'rainbow',
				priority: 4
			});
		}
	}

	// If we have multiple numeric columns, create parallel coordinates (advanced)
	if (numericColumns.length >= 2) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `Multi-dimensional Analysis`,
			description: `Parallel coordinates view of multiple numeric variables`,
			chartType: 'parallel',
			dimensions: numericColumns.slice(0, 5), // Use first 5 numeric columns
			groupBy: categoricalColumns[0] || null,
			aggregation: 'none',
			colorScheme: 'teal',
			priority: 2
		});
	}

	// If we have date columns, create streamgraph (advanced)
	if (dateColumns.length > 0 && numericColumns.length > 0 && categoricalColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} Flow Over Time`,
			description: `Streamgraph showing ${numericColumns[0]} trends by ${categoricalColumns[0]}`,
			chartType: 'streamgraph',
			xAxis: dateColumns[0],
			yAxis: numericColumns[0],
			groupBy: categoricalColumns[0],
			aggregation: 'sum',
			colorScheme: 'warm',
			priority: 1
		});
	}

	// Business chart: Bullet chart for performance metrics
	if (numericColumns.length >= 2) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `Performance Analysis`,
			description: `Bullet chart showing performance vs targets`,
			chartType: 'bullet',
			valueAxis: numericColumns[0],
			targetAxis: numericColumns[1],
			rangeAxis: numericColumns[1], // Use target as range for simplicity
			labelAxis: categoricalColumns[0] || 'Category',
			aggregation: 'avg',
			colorScheme: 'blue',
			priority: 3
		});
	}

	// Network chart if we have relationships
	if (categoricalColumns.length >= 2 && numericColumns.length >= 1) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `Relationship Network`,
			description: `Network diagram showing connections between ${categoricalColumns[0]} and ${categoricalColumns[1]}`,
			chartType: 'network',
			sourceAxis: categoricalColumns[0],
			targetAxis: categoricalColumns[1],
			valueAxis: numericColumns[0],
			aggregation: 'sum',
			colorScheme: 'dark',
			priority: 4
		});
	}

	// Add more chart variants for comprehensive coverage

	// Doughnut chart variant of pie
	if (categoricalColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${categoricalColumns[0]} Breakdown`,
			description: `Doughnut chart showing the breakdown of ${categoricalColumns[0]} categories`,
			chartType: 'doughnut',
			xAxis: categoricalColumns[0],
			yAxis: numericColumns[0] || 'count',
			aggregation: numericColumns[0] ? 'avg' : 'count',
			colorScheme: 'cool',
			priority: 3
		});
	}

	// Area chart variant of line chart
	if (dateColumns.length > 0 && numericColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} Trend Over Time`,
			description: `Area chart showing ${numericColumns[0]} trends over ${dateColumns[0]}`,
			chartType: 'area',
			xAxis: dateColumns[0],
			yAxis: numericColumns[0],
			groupBy: null,
			aggregation: 'avg',
			colorScheme: 'teal',
			priority: 2
		});
	}

	// Polar area chart variant
	if (categoricalColumns.length > 0 && numericColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${categoricalColumns[0]} Magnitude Comparison`,
			description: `Polar area chart comparing magnitudes across ${categoricalColumns[0]}`,
			chartType: 'polarArea',
			xAxis: categoricalColumns[0],
			yAxis: numericColumns[0],
			aggregation: 'sum',
			colorScheme: 'rainbow',
			priority: 3
		});
	}

	// Radar chart for multi-dimensional analysis
	if (numericColumns.length >= 2 && categoricalColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `Multi-Metric Profile`,
			description: `Radar chart showing multi-dimensional profile across ${categoricalColumns[0]}`,
			chartType: 'radar',
			dimensions: numericColumns.slice(0, 6),
			groupBy: categoricalColumns[0],
			aggregation: 'avg',
			colorScheme: 'dark',
			priority: 2
		});
	}

	// Mixed chart combining bar and line
	if (numericColumns.length >= 2 && categoricalColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} vs ${numericColumns[1]} Comparison`,
			description: `Mixed chart showing ${numericColumns[0]} as bars and ${numericColumns[1]} as line`,
			chartType: 'mixed',
			xAxis: categoricalColumns[0],
			yAxis: numericColumns[0],
			yAxis2: numericColumns[1],
			aggregation: 'avg',
			colorScheme: 'warm',
			priority: 2
		});
	}

	// Waterfall chart for sequential changes
	if (numericColumns.length > 0 && categoricalColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} Sequential Changes`,
			description: `Waterfall chart showing sequential changes in ${numericColumns[0]}`,
			chartType: 'waterfall',
			xAxis: categoricalColumns[0],
			yAxis: numericColumns[0],
			aggregation: 'sum',
			colorScheme: 'blue',
			priority: 3
		});
	}

	// Funnel chart for process analysis
	if (numericColumns.length > 0 && categoricalColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${categoricalColumns[0]} Process Flow`,
			description: `Funnel chart showing process flow through ${categoricalColumns[0]} stages`,
			chartType: 'funnel',
			xAxis: categoricalColumns[0],
			yAxis: numericColumns[0],
			aggregation: 'avg',
			colorScheme: 'orange',
			priority: 4
		});
	}

	// Gauge chart for KPI display
	if (numericColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${numericColumns[0]} Performance Gauge`,
			description: `Gauge chart showing ${numericColumns[0]} performance indicator`,
			chartType: 'gauge',
			valueAxis: numericColumns[0],
			aggregation: 'avg',
			colorScheme: 'green',
			priority: 4
		});
	}

	// Sunburst chart for hierarchical data
	if (categoricalColumns.length >= 2 && numericColumns.length > 0) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `Hierarchical ${categoricalColumns[0]} Analysis`,
			description: `Sunburst chart showing hierarchical breakdown of ${categoricalColumns[0]} and ${categoricalColumns[1]}`,
			chartType: 'sunburst',
			dimensions: [categoricalColumns[0], categoricalColumns[1]],
			valueAxis: numericColumns[0],
			aggregation: 'sum',
			colorScheme: 'rainbow',
			priority: 4
		});
	}

	// Heatmap if we have 2+ numeric and 2+ categorical
	if (numericColumns.length >= 1 && categoricalColumns.length >= 2) {
		templates.push({
			id: `chart_${chartId++}`,
			title: `${categoricalColumns[0]} vs ${categoricalColumns[1]} Heatmap`,
			description: `Heatmap showing ${numericColumns[0]} intensity across ${categoricalColumns[0]} and ${categoricalColumns[1]}`,
			chartType: 'heatmap',
			xAxis: categoricalColumns[0],
			yAxis: categoricalColumns[1],
			valueAxis: numericColumns[0],
			aggregation: 'avg',
			colorScheme: 'warm',
			priority: 3
		});
	}

	return templates.slice(0, 12); // Maximum 12 charts
}

async function insightAgent(sampleData, columns, model) {
	const prompt = `You are a Data Insight Generator. Analyze this sample data and provide concise insights that complement advanced visualizations.

Columns: ${columns.join(', ')}

Sample Data:
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

Generate brief insights about:
1. Key patterns and relationships in the data
2. Notable trends, outliers, or anomalies
3. Business implications and actionable recommendations
4. Data quality observations
5. Suggestions for which advanced chart types would be most effective

Available advanced visualizations include: Sankey diagrams, treemaps, network charts, parallel coordinates, violin plots, bullet charts, Gantt charts, heatmaps, and more.

Keep it concise - 4-5 sentences maximum. Focus on insights that help users understand what the AI-generated advanced charts will show them.`;

	try {
		const response = await model.invoke(prompt);
		return {
			agent: 'InsightAgent',
			insights: response.content,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		console.error('Insight Agent Error:', error);
		return {
			agent: 'InsightAgent',
			error: error.message,
			insights: 'Unable to generate insights at this time.'
		};
	}
}

async function orchestratorAgent(sampleData, columns, model) {
	const prompt = `As an Orchestrator Agent, analyze this CSV data and determine the best analysis strategy:

Columns: ${columns.join(', ')}

Sample Data:
${JSON.stringify(sampleData, null, 2)}

Available visualization capabilities include 40+ chart types:
- Basic: line, bar, pie, scatter, area, bubble, radar
- Advanced: heatmap, treemap, sunburst, parallel coordinates, violin plots
- Business: bullet charts, gantt charts, waterfall, funnel, marimekko
- Network: sankey, chord, alluvial, network diagrams
- Statistical: box plots, dendrograms, ridgeline plots
- Financial: candlestick charts, gauge charts
- Specialized: word clouds, calendar heatmaps, pictograms

Determine:
1. Data complexity level (simple, moderate, complex)
2. Primary analysis focus (trends, comparisons, distributions, correlations, flows, hierarchies)
3. Recommended advanced visualization types for this dataset
4. Data quality assessment priority
5. Business context and storytelling approach

Return a structured JSON response with routing recommendations for optimal chart selection.`;

	try {
		const response = await model.invoke(prompt);
		return {
			agent: 'OrchestratorAgent',
			strategy: response.content,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		return { agent: 'OrchestratorAgent', error: error.message };
	}
}

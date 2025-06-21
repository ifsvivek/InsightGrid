<script>
	import BarChart from './BarChart.svelte';
	import LineChart from './LineChart.svelte';
	import PieChart from './PieChart.svelte';

	export let template;
	export let data;

	$: chartType = template?.chartType || 'bar';
</script>

<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
	<div class="mb-4">
		<h4 class="text-lg font-semibold text-gray-800">{template.title}</h4>
		<p class="text-sm text-gray-600">{template.description}</p>
	</div>

	{#if chartType === 'bar'}
		<BarChart {template} {data} />
	{:else if chartType === 'line'}
		<LineChart {template} {data} />
	{:else if chartType === 'pie' || chartType === 'doughnut'}
		<PieChart {template} {data} />
	{:else}
		<!-- Fallback to bar chart -->
		<BarChart {template} {data} />
	{/if}
</div>

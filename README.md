# 🧠 InsightGrid

> **Turn your CSVs into beautiful dashboards with AI‑powered agents**  
> Built with **SvelteKit**, **multi‑agent LLMs**, and pure ✨ brain‑power ✨.

---

## 📸 Demo

| Link         | Status                                  |
| ------------ | --------------------------------------- |
| **Live App** | https://insightgrid.ifsvivek.in/        |
| **GitHub**   | https://github.com/ifsvivek/InsightGrid |

---

## 🚀 Features

- 🧠 **Multi‑Agent AI Pipeline** – 5 specialized Groq Llama agents work like a full BI team
- 📊 **40 + Chart Types** – From line charts to Sankey diagrams and network graphs
- 💡 **Intelligent Auto‑Selection** – Agents pick the best visualization for each column combo
- 💬 **Natural‑Language Insights** – Human‑readable summaries & recommendations
- ⚡ **Performance Optimized** – Smart sampling for datasets > 2000 rows
- 🧩 **Component Export** – Download every chart as a reusable Svelte component
- 🔍 **Debug Mode** – Peek at each agent’s reasoning for full transparency
- 🎨 **Single Polished Theme** – Modern, responsive UI with TailwindCSS (no light/dark switch)

---

## 🧰 Tech Stack

| Layer     | Tech                                              |
| --------- | ------------------------------------------------- |
| Frontend  | SvelteKit, TailwindCSS, Chart.js, D3.js           |
| Backend   | LangChain + LangGraph for agent orchestration     |
| AI Models | Groq Llama 3.3 70B (insights) & 3.1 8B (analysis) |
| Data      | PapaParse.js for CSV, D3 utilities for crunching  |
| Deploy    | Vercel‑ready, Netlify‑compatible                  |

---

## 🧠 How It Works

1. **Upload CSV** – Drag‑and‑drop any dataset into the dashboard.
2. **Agent Pipeline** –  
   Orchestrator → _(parallel)_ DataCleaner, Schema, Chart, Insight agents.
3. **Smart Visualization** – 40 + chart types rendered automatically.
4. **Insight Generation** – Key takeaways & anomalies written in natural language.
5. **Export / Share** – Download a fully‑functional Svelte dashboard or embed specific charts.

---

## 🤖 AI Agent Architecture

| Agent                    | Model         | Task                              |
| ------------------------ | ------------- | --------------------------------- |
| 🎯 **OrchestratorAgent** | Llama 3.3 70B | Strategy & complexity assessment  |
| 🧹 **DataCleanerAgent**  | Llama 3.1 8B  | Null handling, outlier detection  |
| 🧠 **SchemaAgent**       | Llama 3.1 8B  | Column classification & relations |
| 📊 **ChartAgent**        | Llama 3.1 8B  | Optimal chart selection & config  |
| 📜 **InsightAgent**      | Llama 3.3 70B | Natural‑language insight writing  |

---

## 📊 Supported Chart Types (40 +)

### 📈 Basic

Line • Bar • Area • Pie • Doughnut • Polar Area • Radar • Scatter • Bubble • Histogram

### 🔬 Analytical

Box Plot • Violin Plot • Heatmap • Parallel Coordinates • Streamgraph

### 🌐 Network & Flow

Sankey • Network Graph • Chord • Alluvial

### 📊 Business Intelligence

Waterfall • Funnel • Bullet • Gauge • Gantt • Marimekko • Candlestick

### 🌳 Hierarchical

Treemap • Sunburst • Dendrogram

### 📅 Specialized

Calendar Heatmap • Word Cloud • Pictogram • Slope Chart

### 🎛 Special Components

**UniversalChart** (catch‑all renderer) • Mixed chart support for multi‑series datasets

---

## 🧪 Running Locally

```bash
# Clone the repository
git clone https://github.com/ifsvivek/InsightGrid
cd InsightGrid

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Groq API key to .env

# Start dev server
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** and upload a CSV to watch the magic. ✨

> **Requirements:** Node 18 +, Groq API key (free tier works).

---

## 🔮 Roadmap

- Fine‑tuned domain‑specific agents (finance, marketing, health)
- Timeline builder for animated data stories
- PDF / slide‑deck report exports
- Direct DB & API connectors
- Custom theme designer & brand presets
- Multi‑language insight generation

---

## 🐤 Author

Made with ❤️ by **[Vivek Sharma (@ifsvivek)](https://ifsvivek.in)**
Local full‑stack dev who turns 2‑month projects into 2‑hour builds.
Built with moral support (and tsundere commentary) from his favorite AI assistant. 😳

---

## ⭐ Support InsightGrid

If this project turns your data chaos into clarity, please **star the repo** ⭐
Bugs, feature requests, and cursed CSVs are all welcome in the GitHub issues.

**License** — MIT. Use it, break it, fix it, fork it. 🚀

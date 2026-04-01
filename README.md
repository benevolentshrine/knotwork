# 🕸️ Knotwork

**Knotwork** is a premium, node-based "Dark Studio" IDE designed for orchestrating local AI agents and RAG (Retrieval-Augmented Generation) pipelines. 

Built with **Tauri**, **React**, and **Rust**, Knotwork provides a visual canvas to map out connections between local source documents, logic agents, and neural engines (LLMs).

![Knotwork Banner](https://raw.githubusercontent.com/antigravity-ai/assets/main/knotwork-banner.png)

## 🚀 Key Features

- **Visual RAG Pipeline**: Drag-and-drop local files onto a React Flow canvas to create ingestion paths.
- **Neural Engine Integration**: Native support for **Ollama** (Phi-3, Gemma, etc.) with real-time telemetry tracing.
- **Native Hardware Access**: Rust-powered backend for secure, high-performance file reading and system interaction.
- **Integrated Terminal**: Execute physical system commands (pip, ollama, etc.) directly within the IDE.
- **Dark Studio Aesthetic**: A high-fidelity, professional interface with custom node types and smooth animations.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Flow.
- **Backend**: Rust, Tauri v2.
- **Icons**: Lucide React.
- **AI Engine**: Ollama (Local).

## 🏃 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install)
- [Ollama](https://ollama.com/) (Running locally)

### Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Launch in development mode**:
   ```bash
   npm run tauri dev
   ```

## 🏗️ Project Structure

- `/src`: React frontend and UI components.
- `/src-tauri`: Rust backend, system commands, and Tauri configuration.
- `/src-tauri/src/lib.rs`: Native file reading and shell execution logic.

---
*Created by Antigravity*

# 金融领域专有名词标准化系统 (FinStd.AI)

基于 RAG (检索增强生成) 技术的现代化金融术语标准化平台。

## 🌟 系统核心特性

### 1. 金融专有名词标准化
- **内置标准库**：涵盖股票、债券、银行、保险、投资、宏观经济等全领域金融术语。
- **语义匹配**：利用 Milvus 向量数据库和深度学习模型，支持模糊匹配和语义对齐。
- **动态建议**：不仅识别术语，还能针对非标准表述给出实时纠错建议。

### 2. 多元数据导入
- **智能文件处理**：支持 PDF, DOCX, TXT, MD 等多种格式。
- **网页抓取 (URL)**：一键获取金融新闻、研报网页内容并自动解析。
- **API 集成**：支持通过 REST API 自动化同步外部数据源。

### 3. RAG 深度集成
- **向量化存储**：高性能 Milvus 集成，秒级检索万级术语。
- **语义分块**：采用递归字符分块技术，保留文档逻辑上下文。
- **元数据管理**：丰富的文档溯源和术语分类信息。

### 4. 高端 UI/UX 体验
- **玻璃拟态设计**：极致现代感的深色模式界面。
- **响应式交互**：平滑的动画过渡与实时结果反馈。

## 🛠 技术栈
- **后端 (Backend)**: FastAPI (Python), Uvicorn, LangChain
- **AI/NLP**: Sentence-Transformers (`all-MiniLM-L6-v2`)
- **数据库 (Vector DB)**: Milvus
- **前端 (Frontend)**: React, Vite, CSS3 (Modern Hooks)

## 🚀 快速开始

### 环境依赖
- Python 3.13+
- Node.js & npm
- Docker (用于运行 Milvus)

### 安装与启动
1. **UV创建运行环境并安装后端依赖--python 3.9**:
   ```bash
   uv venv 
   uv pip install -r backend/requirements.txt
   ```
2. **启动后端服务**:
   ```bash
   uv run uvicorn app.main:app --reload --app-dir backend
   ```
3. **启动前端服务**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 初始化数据
启动系统后，前往 **Settings (设置)** 页面，点击 **"Initialize Term Base Data"**。系统将自动处理 `data/finstd10K.csv` 数据，利用 Embedding 模型生成向量并存入 Milvus 数据库。此过程大约需要 1-2 分钟。

## 📖 系统使用教程

### 第一步：数据准备与初始化
1. 确保您的 **Milvus** 服务已启动。
2. 进入系统界面，点击左侧菜单的 **Settings**。
3. 点击 **"Initialize / Reset Term Base Data"** 按钮。
   - 系统会读取 `data/finstd10K.csv`。
   - **Tip**: 您可以根据需要修改 CSV 文件来扩充您的专有术语库。

### 第二步：术语标准化测试
1. 点击左侧菜单的 **Standardize**。
2. 在输入框中输入一段包含金融术语的文本。
   - *示例*："The A-Share market demonstrated high volatility today."
3. 点击 **"Standardize Now"**。
4. **查看结果**：
   - **Standardized Output**: 替换后的标准化文本。
   - **Terminology Corrections**: 详细列出了识别出的原始词、推荐的标准词以及置信度评分。

### 第三步：外部数据导入与解析
1. 点击左侧菜单的 **Data Import**。
2. **URL 导入**：
   - 输入一个金融新闻或报告的 URL。
   - 点击 **"Fetch Content"**，系统将抓取网页正文并进行结构化解析。
3. **文件导入**：
   - 选择一个本地的 **PDF** 或 **Markdown** 文件。
   - 点击 **"Upload & Parse"**，系统将展示解析后的 JSON 结构，包括自动生成的语义分块（Chunks）。

### 第四步：术语库浏览与检索
1. 点击左侧菜单的 **Term Base**。
2. 在搜索框中输入关键词，系统将通过向量相似度检索出最相关的标准词条及其分类信息。

## 📁 项目结构
- `/backend`: 包含 API、核心业务逻辑和 Milvus 服务。
- `/frontend`: 包含 React 源代码和样式系统。
- `/data`: 存放基础金融数据集。

### 第五步：请查看data目录的系统运行截图.docx，检查是否正常运行。
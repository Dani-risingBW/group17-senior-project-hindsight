# Plan: Project Discovery & AI Model Selection Doc

Create a standalone Markdown document (saved to Files) that the team can use to scope the **Social Media Research Navigator** before building anything.

## Document contents

### 1. Discovery questions (team discussion guide)
Organized by theme, each with why it matters:
- **Data & archive**: What formats did Easy Chair exports produce (PDF, DOCX, CSV, video)? Volume per year? Metadata quality? OCR needs for scans? Rights/permissions to host materials?
- **Users & use cases**: Who queries it (faculty, students, outside researchers)? Example questions they should be able to ask? Public or campus-only access?
- **Verification & trust**: What counts as a "verifiable source" citation — page-level, paragraph-level? How to handle conflicting or retracted findings?
- **"Then and Now" feature**: How are "predictions" identified in old papers — manually tagged or AI-extracted? What does a comparison output look like?
- **Scope & MVP**: Which years/materials first? What's the smallest demo that proves value?
- **Success metrics**: Retrieval accuracy, citation precision, user satisfaction?

### 2. Candidate AI models comparison
Table comparing top current models for the agent's jobs (document Q&A / RAG, summarization, citation extraction, embeddings):
- **OpenAI GPT family** (e.g. GPT-5.x): strongest reasoning & tool use, good for the analytical "Then and Now" comparisons
- **Google Gemini family**: very long context windows (good for whole conference programs), strong multimodal (workshop recordings/video), cheaper flash tiers
- **Anthropic Claude family**: strong long-document analysis and careful citation behavior
- **Embedding models** (for search over the archive): OpenAI/Gemini embedding options
- **Speech-to-text** (for workshop recordings): transcription models
- Trade-offs covered: context size, cost, speed, citation faithfulness, multimodal support, open vs. closed weights, data privacy for an academic archive
- A recommended starter stack (frontier chat model + embeddings + transcription) with reasoning

### 3. Architecture concepts to research
- RAG (retrieval-augmented generation) vs. long-context prompting — the core design decision
- Chunking strategies for academic papers; metadata tagging by year/track
- Citation/grounding techniques so every answer links to the source document
- Handling discontinuous years and noisy OCR text
- Evaluating answers: faithfulness, hallucination checks, building a test question set

### 4. Skills the team will use
- Prompt engineering & agent design
- Data cleaning/preprocessing (PDFs, OCR, CSV exports)
- Vector databases & semantic search
- Basic web app development (frontend + backend)
- Research ethics & data governance (FERPA-adjacent, copyright of submissions)
- Evaluation & testing of AI outputs

### 5. Suggested next steps / milestone outline
Short phased roadmap: data audit → prototype retrieval over one year → add chat agent → "Then and Now" → evaluation.

## Technical details
- Single Markdown file delivered to `/mnt/documents` (Files), no app code changes.
- Model names/pricing verified with a quick web check at build time so the comparison reflects current 2026 models.

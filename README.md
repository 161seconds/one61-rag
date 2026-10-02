# 📦 One61 RAG — Domain-Specific Multi-Agent AI Service

Hệ thống **Multi-Agent RAG** chuyên biệt cho bài toán Quản lý Kho bãi, Logistics & Vận chuyển hàng hóa (Supply Chain).

Hệ thống kết hợp:
* **Guard & Router Agent**: Tự động phân loại intent, phát hiện prompt injection, bóc tách thực thể mã đơn (`TRK...`, `ORD...`, `DEL...`, `FL...`, `DMG...`).
* **Text-to-SQL Agent**: Tự động sinh truy vấn an toàn để tra cứu thông tin hành trình vận đơn, chi tiết hàng hỏng, cân nặng lệch trực tiếp từ PostgreSQL.
* **Knowledge Graph RAG Agent (LightRAG + BGE-M3 + Qdrant)**: Trích xuất tri thức từ tài liệu SOP, chính sách bồi thường & quy trình kho bãi.
* **Verification Agent**: Kiểm định chống ảo giác (Anti-Hallucination), đối chiếu claim với context trước khi phản hồi người dùng.
* **Interactive Demo UI**: Giao diện Web trực quan tích hợp sẵn tại `/demo` để chat, theo dõi `<thinking>` của các agent và tải lên tài liệu mới.

---

## 🏗️ Cấu trúc thư mục

```text
one61-rag/
├── src/
│   ├── agents/           # Router, SQL Agent, RAG Agent, Verification Agent
│   ├── rag/              # LightRAG engine, BGE-M3 embeddings, parser, chunker
│   ├── cache/            # Redis Semantic Cache
│   ├── memory/           # Conversation Memory & Auto-summarizer
│   ├── db/               # PostgreSQL async connection (Warehouse data)
│   ├── llm/              # Gemini / Groq model connectors
│   ├── static/           # Giao diện Demo Web Console (demo.html)
│   └── main.py           # FastAPI Application & API Endpoints
├── data/                 # Datasets kho, packing slips, deliveries, extracted JSONs
├── scripts/              # Scripts nạp dữ liệu SOP, audit dữ liệu, SQL schema
├── SEAL SP2026 FOR STUDENTS/ # Tài liệu gốc & đề bài Hackathon
├── docker-compose.yml    # Hạ tầng: Qdrant Vector DB, Redis Cache, Postgres
├── pyproject.toml        # Cấu hình dependencies Python (uv)
└── .env                  # Biến môi trường & API Keys
```

---

## 🚀 Hướng dẫn khởi chạy nhanh

### 1. Yêu cầu môi trường
* **Python**: `>= 3.11`
* **uv**: Trình quản lý package Python (`pip install uv`)
* **Docker Desktop**: Để chạy Qdrant, Redis và PostgreSQL

---

### 2. Cấu hình biến môi trường (`.env`)
Kiểm tra file `.env` và điền `GEMINI_API_KEY` (hoặc `GROQ_API_KEYS`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FAST_MODEL=gemini-2.5-flash-lite
```

---

### 3. Khởi động hạ tầng Docker
Khởi chạy **Qdrant Vector DB**, **Redis Cache**, và **PostgreSQL** (tự động nạp bảng kho bãi):
```bash
docker compose up -d
```

---

### 4. Cài đặt Dependencies
```bash
uv sync --extra dev
```

---

### 5. Khởi chạy RAG Service
```bash
uv run python -m src.main
```

---

## 🌐 Trải nghiệm & Kiểm thử

* **Giao diện Demo Web & Test Console**: [http://localhost:8000/demo](http://localhost:8000/demo)
* **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
* **Qdrant Dashboard**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard)

---

## 📡 Danh sách API chính

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/chat` | Chat đồng bộ với Agent Pipeline (trả về kết quả, luồng suy luận & metadata) |
| `POST` | `/api/chat/async` | Chat bất đồng bộ (trả về 202 và gửi kết quả tới `CALLBACK_URL`) |
| `POST` | `/api/ingest` | Upload và nhúng tài liệu (PDF, Word, TXT) vào Vector DB |
| `GET` | `/demo` | Giao diện Web Console test Agentic RAG |
| `GET` | `/health` | Kiểm tra trạng thái hệ thống & các model đang kết nối |

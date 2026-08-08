# Igreja+ | Sistema Profissional de Gestão de Igreja ERP

**Igreja+** é um sistema completo, moderno e escalável de gerenciamento eclesiástico construído com **Clean Architecture**, permitindo execução multiplataforma em ambiente local (Windows via Electron), servidores Linux/Cloud e Docker.

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.13+**
- **FastAPI**
- **SQLAlchemy 2.0** & **Alembic**
- **Pydantic v2**
- **ReportLab** (Geração de PDFs) & **qrcode**
- **openpyxl** (Relatórios em Excel/XLSX)

### Frontend
- **React 19** & **TypeScript**
- **Vite**
- **TailwindCSS** & Lucide Icons
- **@hello-pangea/dnd** (Drag & Drop para Escalas)
- **Recharts** (Gráficos do Dashboard)
- **TanStack React Query** & **Axios**

### Banco de Dados & Infraestrutura
- **PostgreSQL 16**
- **Electron** (Desktop Windows Executable)
- **Docker & Docker Compose**

---

## 🚀 Como Executar

### 1. Executando com Docker Compose (Recomendado)

Rode apenas um comando na raiz do projeto:

```bash
docker-compose up -d --build
```

O sistema estará disponível em:
- **Frontend App**: `http://localhost`
- **Backend API**: `http://localhost:8000`
- **Documentação Swagger**: `http://localhost:8000/docs`

### 2. Executando Localmente no Windows / Desenvolvimento

#### Backend (FastAPI):
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```

Acesse no navegador: `http://localhost:3000`

---

## 🔐 Credenciais Padrão de Acesso

- **Usuário**: `admin`
- **Senha**: `admin123`
- **Nível**: Administrador Geral

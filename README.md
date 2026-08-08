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
 --port 8000
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

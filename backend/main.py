import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import Usuario, Setor, Configuracao
from app.core.security import get_password_hash

# Import routers
from app.api.v1.auth import router as auth_router
from app.api.v1.membros import router as membros_router
from app.api.v1.setores import router as setores_router
from app.api.v1.escalas import router as escalas_router
from app.api.v1.carteirinhas import router as carteirinhas_router
from app.api.v1.usuarios import router as usuarios_router
from app.api.v1.relatorios import router as relatorios_router
from app.api.v1.auditoria import router as auditoria_router
from app.api.v1.configuracoes import router as configuracoes_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.busca import router as busca_router
from app.api.v1.eventos import router as eventos_router

from sqlalchemy import text

# Create uploads directories
for sub in ["fotos", "documentos", "logos", "carteirinhas", "exportacoes"]:
    os.makedirs(os.path.join(settings.UPLOAD_DIR, sub), exist_ok=True)

def check_and_migrate_db():
    statements = [
        "ALTER TABLE membros ADD COLUMN cargo VARCHAR(50) DEFAULT 'Membro'",
        "ALTER TABLE escalas ADD COLUMN tipo_escala VARCHAR(50) DEFAULT 'GERAL'",
        "ALTER TABLE escalas ADD COLUMN mes_ano VARCHAR(50)",
        "ALTER TABLE escalas ADD COLUMN dados_matriz TEXT",
        "ALTER TABLE usuarios ADD COLUMN exige_nova_senha BOOLEAN DEFAULT FALSE"
    ]
    for stmt in statements:
        try:
            with engine.begin() as conn:
                conn.execute(text(stmt))
        except Exception as e:
            pass

check_and_migrate_db()

# Create database tables automatically
Base.metadata.create_all(bind=engine)

def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed default Admin User
        admin = db.query(Usuario).filter(Usuario.login == "admin").first()
        if not admin:
            admin = Usuario(
                nome="Administrador Geral",
                login="admin",
                senha_hash=get_password_hash("admin123"),
                nivel="Administrador",
                ativo=True
            )
            db.add(admin)
            db.commit()
            print("[SEED] Default admin user created (login: admin, pass: admin123)")
        else:
            admin.senha_hash = get_password_hash("admin123")
            admin.ativo = True
            db.commit()

        # Seed default Sectors if empty
        if not db.query(Setor).first():
            setores_iniciais = [
                ("Tio", "Dá aula para alunos de 0 a 7 anos (Berçário e Jardim)"),
                ("Professor", "Dá aula para alunos de 8 a 17 anos (Juniores e Adolescentes)"),
                ("Introdutor", "Recepção, acolhimento e introdução dos cultos"),
                ("Pregador", "Pregação e ministração da Palavra"),
                ("Ofertório", "Coleta e dedicação dos dízimos e ofertas"),
                ("Dirigente", "Dirigente de louvor e condução do culto"),
                ("Apoio", "Backvocal e apoio ao ministério de louvor"),
                ("Músico", "Instrumentistas (Teclado, Bateria, Violão/Guitarra, Baixo)"),
                ("Mídia", "Operação de Data Show, som e transmissão"),
                ("Diaconato", "Serviço de apoio e ordem na igreja"),
                ("Secretaria", "Atendimento e gestão documental")
            ]
            for nome, desc in setores_iniciais:
                db.add(Setor(nome=nome, descricao=desc, ativo=True))
            db.commit()
            print("[SEED] Default sectors initialized")

        # Seed default Configuration if empty
        if not db.query(Configuracao).first():
            db.add(Configuracao(
                nome_igreja="Igreja Evangélica Igreja+",
                cnpj="00.000.000/0001-00",
                pastor_presidente="Pr. João Carlos Silva",
                endereco="Av. Principal, 1000 - Centro",
                telefone="(11) 99999-8888",
                email="contato@igrejaplus.org.br",
                site="www.igrejaplus.org.br"
            ))
            db.commit()
            print("[SEED] Default church settings initialized")
    except Exception as e:
        print(f"[SEED ERROR] {e}")
    finally:
        db.close()

seed_initial_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(membros_router, prefix=f"{settings.API_V1_STR}/membros", tags=["Membros"])
app.include_router(setores_router, prefix=f"{settings.API_V1_STR}/setores", tags=["Setores"])
app.include_router(escalas_router, prefix=f"{settings.API_V1_STR}/escalas", tags=["Escalas"])
app.include_router(carteirinhas_router, prefix=f"{settings.API_V1_STR}/carteirinhas", tags=["Carteirinhas"])
app.include_router(usuarios_router, prefix=f"{settings.API_V1_STR}/usuarios", tags=["Usuários"])
app.include_router(relatorios_router, prefix=f"{settings.API_V1_STR}/relatorios", tags=["Relatórios"])
app.include_router(auditoria_router, prefix=f"{settings.API_V1_STR}/auditoria", tags=["Auditoria"])
app.include_router(configuracoes_router, prefix=f"{settings.API_V1_STR}/configuracoes", tags=["Configurações"])
app.include_router(dashboard_router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(busca_router, prefix=f"{settings.API_V1_STR}/busca", tags=["Busca Global"])
app.include_router(eventos_router, prefix=f"{settings.API_V1_STR}/eventos", tags=["Eventos"])

@app.get("/api/v1/health")
def health_check():
    return {"project": settings.PROJECT_NAME, "status": "online", "docs": "/docs"}

# Mount frontend SPA if dist exists (Render / Production deployment)
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    from fastapi.responses import FileResponse
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("redoc"):
            return {"error": "Not Found"}
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"project": settings.PROJECT_NAME, "status": "online", "docs": "/docs"}

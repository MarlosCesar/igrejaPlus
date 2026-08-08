import os
import json
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from app.core.config import settings

def generate_carteirinha_pdf(membro_nome: str, cargo: str, congregacao: str, emissao: str, data_batismo: str = None, qr_code_path: str = None, foto_path: str = None, igreja_nome: str = "Igreja Cristã Nova Vida") -> str:
    """
    Generates a high quality printable membership card PDF matching the exact updated template.
    """
    clean_name = membro_nome.replace(" ", "_").lower()
    filename = f"carteirinha_{clean_name}.pdf"
    output_dir = os.path.join(settings.UPLOAD_DIR, "carteirinhas")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, filename)

    card_w, card_h = 8.5 * cm, 5.5 * cm
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=(card_w, card_h),
        rightMargin=0.2*cm,
        leftMargin=0.2*cm,
        topMargin=0.2*cm,
        bottomMargin=0.2*cm
    )
    story = []

    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'CardHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1,
        spaceAfter=1
    )
    sub_header = ParagraphStyle(
        'CardSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.5,
        textColor=colors.HexColor('#2563EB'),
        alignment=1,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'CardBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        textColor=colors.HexColor('#1E293B'),
        leading=8
    )

    story.append(Paragraph(f"<b>{igreja_nome.upper()}</b>", header_style))
    story.append(Paragraph(f"<b>{congregacao.upper() if congregacao else 'JARDIM PRIMAVERA'}</b>", sub_header))

    cargo_str = f"<br/><b>Cargo:</b> {cargo}" if cargo and cargo.lower() != 'membro' else ""
    batismo_str = f"<br/><b>Batismo:</b> {data_batismo}" if data_batismo else ""

    details_text = f"<b>Membro:</b> {membro_nome}{cargo_str}{batismo_str}<br/>" \
                   f"<b>Emissão:</b> {emissao}"

    content_data = [[Paragraph(details_text, body_style)]]

    table = Table(content_data, colWidths=[8.1*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))

    story.append(table)
    doc.build(story)

    return f"/uploads/carteirinhas/{filename}"


def generate_escala_geral_pdf(titulo: str, mes_ano: str, payload: dict, filename: str) -> str:
    """
    Generates a PDF for Escala Geral matching Image 1 layout (Purple theme, Landscape A4).
    """
    output_dir = os.path.join(settings.UPLOAD_DIR, "exportacoes")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=landscape(A4),
        rightMargin=0.5*cm,
        leftMargin=0.5*cm,
        topMargin=0.5*cm,
        bottomMargin=0.5*cm
    )
    story = []

    cultos = payload.get("cultos", [])
    funcoes = payload.get("funcoes", [])
    matriz = payload.get("matriz", {})

    # Top Header Banner
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'PurpleTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.black,
        alignment=1,
        spaceAfter=4
    )

    # Build Table Matrix
    header_cultos = [""] + [c.get("culto", "") for c in cultos]
    header_datas = ["DATA"] + [c.get("data", "") for c in cultos]
    header_dias = ["DIA"] + [c.get("dia", "") for c in cultos]

    table_data = [
        [f"ESCALA DO MÊS DE {mes_ano.upper()}"] + [""] * len(cultos),
        header_cultos,
        header_datas,
        header_dias,
    ]

    for funcao in funcoes:
        row = [funcao]
        for cIdx in range(len(cultos)):
            val = matriz.get(f"{cIdx}_{funcao}", "//")
            row.append(val or "//")
        table_data.append(row)

    # Footer Obs
    obs_text = "Obs.: TODOS OS CULTOS DEVEM SER PRECEDIDOS DE PELO MENOS 15 MINUTOS DE ORAÇÃO!"
    table_data.append([obs_text] + [""] * len(cultos))

    col_widths = [2.2*cm] + [1.3*cm] * len(cultos)
    t = Table(table_data, colWidths=col_widths)

    t_style = [
        ('SPAN', (0,0), (-1,0)), # Merge Title row
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#C084FC')), # Purple header
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),

        ('BACKGROUND', (0,1), (-1,3), colors.HexColor('#F3E8FF')), # Sub headers
        ('FONTNAME', (0,1), (-1,3), 'Helvetica-Bold'),
        ('FONTSIZE', (0,1), (-1,3), 6.5),
        ('ALIGN', (0,1), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),

        ('BACKGROUND', (0,4), (0,-2), colors.HexColor('#E9D5FF')), # Role column
        ('FONTNAME', (0,4), (0,-2), 'Helvetica-Bold'),
        ('FONTSIZE', (0,4), (0,-2), 6.5),
        ('FONTSIZE', (1,4), (-1,-2), 6),

        ('SPAN', (0,-1), (-1,-1)), # Merge Footer Obs
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#C084FC')),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 7),
        ('TEXTCOLOR', (0,-1), (-1,-1), colors.black),

        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#475569')),
        ('PADDING', (0,0), (-1,-1), 2),
    ]

    t.setStyle(TableStyle(t_style))
    story.append(t)
    doc.build(story)

    return f"/uploads/exportacoes/{filename}"


def generate_escala_ebi_pdf(titulo: str, mes_ano: str, payload: dict, filename: str) -> str:
    """
    Generates a PDF for Escala EBI matching Image 2 layout (Navy blue theme, A4).
    """
    output_dir = os.path.join(settings.UPLOAD_DIR, "exportacoes")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=1*cm,
        leftMargin=1*cm,
        topMargin=1*cm,
        bottomMargin=1*cm
    )
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'NavyTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#1E293B'),
        alignment=1,
        spaceAfter=12
    )

    story.append(Paragraph("ESCOLA BÍBLICA INFANTIL", title_style))
    story.append(Spacer(1, 0.4*cm))

    domingos = payload.get("domingos", [])
    salas = payload.get("salas", [])
    matriz = payload.get("matriz", {})

    table_data = [
        [mes_ano.upper()] + [""] * len(domingos),
        ["Salas / Datas"] + domingos
    ]

    for sala in salas:
        row = [sala.get("label", "")]
        for dIdx in range(len(domingos)):
            val = matriz.get(f"{sala.get('key')}_{dIdx}", "-")
            row.append(val or "-")
        table_data.append(row)

    col_w = [4.5*cm] + [2.8*cm] * len(domingos)
    t = Table(table_data, colWidths=col_w)

    t.setStyle(TableStyle([
        ('SPAN', (0,0), (-1,0)),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),

        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#334155')),
        ('TEXTCOLOR', (0,1), (-1,1), colors.white),
        ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,1), (-1,1), 9),
        ('ALIGN', (0,1), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),

        ('BACKGROUND', (0,2), (0,-1), colors.HexColor('#F1F5F9')),
        ('FONTNAME', (0,2), (0,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,2), (0,-1), 8.5),
        ('FONTSIZE', (1,2), (-1,-1), 8.5),

        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#94A3B8')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))

    story.append(t)
    doc.build(story)

    return f"/uploads/exportacoes/{filename}"


def generate_report_pdf(title: str, headers: list, data: list, filename: str) -> str:
    """
    Generates a generic tabular report in PDF format.
    """
    output_dir = os.path.join(settings.UPLOAD_DIR, "exportacoes")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=1*cm, leftMargin=1*cm, topMargin=1*cm, bottomMargin=1*cm)
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#0F172A'),
        alignment=1,
        spaceAfter=10
    )

    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 0.3*cm))

    table_data = [headers] + data
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,0), 5),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 7),
    ]))

    story.append(table)
    doc.build(story)
    return f"/uploads/exportacoes/{filename}"


def generate_relatorio_evento_pdf(titulo_evento: str, data_evento: str, local: str, inscritos: list) -> str:
    """
    Generates a printable PDF report for event participants.
    """
    output_dir = os.path.join(settings.UPLOAD_DIR, "exportacoes")
    os.makedirs(output_dir, exist_ok=True)
    clean_title = titulo_evento.replace(" ", "_").lower()
    filename = f"relatorio_evento_{clean_title}.pdf"
    pdf_path = os.path.join(output_dir, filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=1*cm,
        leftMargin=1*cm,
        topMargin=1*cm,
        bottomMargin=1*cm
    )
    story = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'EvTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1,
        spaceAfter=4
    )
    sub_style = ParagraphStyle(
        'EvSub',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=12
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        textColor=colors.HexColor('#1E293B')
    )

    story.append(Paragraph(f"RELATÓRIO DE PARTICIPANTES - {titulo_evento.upper()}", title_style))
    story.append(Paragraph(f"Data do Evento: {data_evento} | Local: {local} | Total de Inscritos: {len(inscritos)}", sub_style))

    table_data = [
        ["Nº", "NOME COMPLETO", "TELEFONE", "CONGREGAÇÃO", "DATA INSCRIÇÃO"]
    ]

    for idx, ins in enumerate(inscritos, 1):
        dt_str = ins.data_inscricao.strftime("%d/%m/%Y %H:%M") if hasattr(ins.data_inscricao, "strftime") else str(ins.data_inscricao)
        table_data.append([
            str(idx),
            Paragraph(ins.nome or "-", cell_style),
            ins.telefone or "-",
            ins.congregacao or "Jardim Primavera",
            dt_str
        ])

    table = Table(table_data, colWidths=[1*cm, 7.5*cm, 3.5*cm, 4*cm, 3*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))

    story.append(table)
    doc.build(story)

    return f"/uploads/exportacoes/{filename}"

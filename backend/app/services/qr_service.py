import os
import qrcode
from app.core.config import settings

def generate_qr_code(data: str, filename: str) -> str:
    """
    Generates a QR code image and saves it to uploads/carteirinhas folder.
    Returns relative web path.
    """
    output_dir = os.path.join(settings.UPLOAD_DIR, "carteirinhas")
    os.makedirs(output_dir, exist_ok=True)

    filepath = os.path.join(output_dir, filename)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filepath)

    return f"/uploads/carteirinhas/{filename}"

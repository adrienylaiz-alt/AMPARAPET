"""Processamento das fotos: validação, compressão e miniatura.

Se as variáveis CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET
existirem, as fotos vão para o Cloudinary (e o banco guarda o link https completo).
Sem elas, as fotos continuam sendo salvas na pasta uploads/ (uso local).
"""

import io
import os
import re
import shutil
import uuid

from fastapi import HTTPException
from PIL import Image, ImageOps, UnidentifiedImageError

from . import config

FORMATOS_ACEITOS = {"JPEG", "PNG", "WEBP"}

# Evita "bombas" de descompressão (imagens gigantes em poucos bytes)
Image.MAX_IMAGE_PIXELS = 50_000_000

PASTA_CLOUDINARY = "amparapet/animais"

CLOUDINARY_ATIVO = bool(
    os.getenv("CLOUDINARY_CLOUD_NAME")
    and os.getenv("CLOUDINARY_API_KEY")
    and os.getenv("CLOUDINARY_API_SECRET")
)

if CLOUDINARY_ATIVO:
    import cloudinary
    import cloudinary.api
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def _pasta_animal(animal_id: int):
    return config.UPLOAD_DIR / "animais" / str(animal_id)


def _salvar_webp(img: Image.Image, lado_max: int, destino) -> None:
    copia = img.copy()
    copia.thumbnail((lado_max, lado_max), Image.Resampling.LANCZOS)  # mantém proporção, sem distorcer
    copia.save(destino, "WEBP", quality=82, method=4)


def _enviar_cloudinary(img: Image.Image, lado_max: int, public_id: str) -> str:
    """Gera o WEBP na memória, envia ao Cloudinary e devolve o link https."""
    buffer = io.BytesIO()
    _salvar_webp(img, lado_max, buffer)
    buffer.seek(0)
    resultado = cloudinary.uploader.upload(
        buffer,
        public_id=public_id,
        resource_type="image",
        overwrite=True,
    )
    return resultado["secure_url"]


def _public_id_da_url(url: str) -> str:
    """Extrai o public_id de um link do Cloudinary (tira a versão e a extensão)."""
    resto = url.split("/upload/", 1)[1]
    partes = resto.split("/")
    if partes and re.fullmatch(r"v\d+", partes[0]):
        partes = partes[1:]
    return "/".join(partes).rsplit(".", 1)[0]


def processar_foto(conteudo: bytes, nome_original: str, animal_id: int) -> tuple[str, str]:
    """Valida a imagem e grava a versão grande e a miniatura em WEBP.
    Retorna a foto e a miniatura: links https do Cloudinary (quando ativo)
    ou caminhos relativos dentro de uploads/ (modo local)."""
    limite = config.FOTO_TAMANHO_MAX_MB * 1024 * 1024
    if len(conteudo) > limite:
        raise HTTPException(413, f"'{nome_original}' passa de {config.FOTO_TAMANHO_MAX_MB} MB")
    try:
        img = Image.open(io.BytesIO(conteudo))
        formato = img.format
        img.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(415, f"'{nome_original}' não é uma imagem válida") from None
    if formato not in FORMATOS_ACEITOS:
        raise HTTPException(415, f"'{nome_original}': formato não aceito. Use JPG, PNG ou WEBP")

    img = ImageOps.exif_transpose(img)  # corrige fotos de celular deitadas
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

    nome = uuid.uuid4().hex

    if CLOUDINARY_ATIVO:
        base_id = f"{PASTA_CLOUDINARY}/{animal_id}"
        try:
            url_foto = _enviar_cloudinary(img, config.FOTO_LADO_MAX, f"{base_id}/{nome}")
            url_mini = _enviar_cloudinary(img, config.MINIATURA_LADO_MAX, f"{base_id}/{nome}_mini")
        except Exception:
            raise HTTPException(502, "Não foi possível enviar a foto para o Cloudinary") from None
        return url_foto, url_mini

    pasta = _pasta_animal(animal_id)
    pasta.mkdir(parents=True, exist_ok=True)
    _salvar_webp(img, config.FOTO_LADO_MAX, pasta / f"{nome}.webp")
    _salvar_webp(img, config.MINIATURA_LADO_MAX, pasta / f"{nome}_mini.webp")
    base = f"animais/{animal_id}"
    return f"{base}/{nome}.webp", f"{base}/{nome}_mini.webp"


def remover_arquivos(*caminhos: str) -> None:
    for c in caminhos:
        if c.startswith("http"):
            if CLOUDINARY_ATIVO and "/upload/" in c:
                try:
                    cloudinary.uploader.destroy(_public_id_da_url(c), invalidate=True)
                except Exception:
                    pass  # se falhar, a foto fica órfã no Cloudinary, mas o sistema segue
        else:
            (config.UPLOAD_DIR / c).unlink(missing_ok=True)


def remover_pasta_animal(animal_id: int) -> None:
    if CLOUDINARY_ATIVO:
        try:
            cloudinary.api.delete_resources_by_prefix(f"{PASTA_CLOUDINARY}/{animal_id}/")
        except Exception:
            pass
    shutil.rmtree(_pasta_animal(animal_id), ignore_errors=True)
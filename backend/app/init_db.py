"""Cria as tabelas, o administrador inicial e os dados padrão do abrigo.

Num banco novo também cadastra os animais de exemplo da pasta exemplos/ (com fotos),
para o sistema não começar vazio depois de clonar o projeto.

Uso (na pasta backend):
    python -m app.init_db              cria o que estiver faltando
    python -m app.init_db --exemplos   cadastra os animais de exemplo (só se não houver nenhum animal)
"""

import json
import sys
from datetime import date
from pathlib import Path

from sqlalchemy import func, select

from . import config, imagens, security, servicos
from .database import Base, SessionLocal, engine
from .models import Animal, Configuracao, Foto, StatusAnimal, Usuario

PASTA_EXEMPLOS = Path(__file__).parent / "exemplos"


def criar_estrutura() -> None:
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        existentes = set(db.scalars(select(Configuracao.chave)))
        for chave, valor in servicos.CONFIG_PADRAO.items():
            if chave not in existentes:
                db.add(Configuracao(chave=chave, valor=valor))
        # bancos antigos ainda apontam para a interface de teste (endereços trocados pelo abrigo ficam)
        pagina = db.get(Configuracao, "url_pagina_animal")
        if pagina and pagina.valor == "http://localhost:8000/teste/animal.html?id={id}":
            pagina.valor = servicos.CONFIG_PADRAO["url_pagina_animal"]
        if not db.scalar(select(func.count()).select_from(Usuario)):
            db.add(
                Usuario(
                    nome=config.ADMIN_INICIAL_NOME,
                    email=config.ADMIN_INICIAL_EMAIL.lower(),
                    senha_hash=security.hash_senha(config.ADMIN_INICIAL_SENHA),
                )
            )
            print(f"Administrador inicial criado: {config.ADMIN_INICIAL_EMAIL}")
            banco_novo = True
        else:
            banco_novo = False
        db.commit()
    if banco_novo and config.CARREGAR_EXEMPLOS:
        criar_exemplos()


def criar_exemplos() -> None:
    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Animal)):
            print("Já existem animais cadastrados; exemplos não foram criados.")
            return
        admin = db.scalar(select(Usuario).order_by(Usuario.id))
        exemplos = json.loads((PASTA_EXEMPLOS / "animais.json").read_text(encoding="utf-8"))
        for dados in exemplos:
            fotos = dados.pop("fotos")
            status = StatusAnimal(dados.pop("status"))
            nasc = dados.pop("data_nascimento")
            a = Animal(**dados, data_nascimento=date.fromisoformat(nasc) if nasc else None)
            servicos.mudar_status(db, a, StatusAnimal.DISPONIVEL, admin, "Cadastro")
            db.add(a)
            db.flush()
            if status != StatusAnimal.DISPONIVEL:
                servicos.mudar_status(db, a, status, admin, "Exemplo")
            for ordem, nome in enumerate(fotos):
                conteudo = (PASTA_EXEMPLOS / "fotos" / nome).read_bytes()
                arq, mini = imagens.processar_foto(conteudo, nome, a.id)
                a.fotos.append(Foto(arquivo=arq, miniatura=mini, ordem=ordem))
        db.commit()
        print(f"{len(exemplos)} animais de exemplo cadastrados.")


if __name__ == "__main__":
    criar_estrutura()
    print("Tabelas e dados padrão OK.")
    if "--exemplos" in sys.argv:
        criar_exemplos()

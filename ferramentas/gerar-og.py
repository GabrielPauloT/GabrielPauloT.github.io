#!/usr/bin/env python3
"""Gera assets/img/og.png (imagem de compartilhamento, 1200x630) a partir de ferramentas/og.html.

Uso: python3 ferramentas/gerar-og.py
Rodar com `python3` puro: com `python3 -I` o Playwright do ~/.local não é encontrado.
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

raiz = Path(__file__).resolve().parent.parent
origem = raiz / "ferramentas" / "og.html"
destino = raiz / "assets" / "img" / "og.png"

with sync_playwright() as p:
    navegador = p.chromium.launch()
    pagina = navegador.new_page(viewport={"width": 1200, "height": 630})
    pagina.goto(origem.as_uri(), wait_until="networkidle")
    pagina.evaluate("document.fonts.ready")
    pagina.screenshot(path=str(destino))
    navegador.close()

print(f"Imagem gerada: {destino}")

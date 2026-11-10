# gabrielpaulot.github.io

Site pessoal de Gabriel Paulo Tavares da Silva, Tech Lead Fullstack. Está publicado em https://gabrielpaulot.github.io.

O site é estático (HTML, CSS e JavaScript, sem dependências) e é publicado pelo GitHub Pages a partir da `main`.

## Estrutura

- `index.html`: a página inteira.
- `assets/css/site.css` e `assets/js/site.js`: visual e interações (painel split-flap, cronômetro, pontos e revelação ao rolar). O JavaScript respeita `prefers-reduced-motion`.
- `assets/fonts/`: Archivo (variável) e IBM Plex Mono em WOFF2, hospedadas no próprio site. Vêm do Google Fonts e têm licença OFL.
- `curriculo/Gabriel-Tavares-Curriculo.pdf`: versão pública do currículo, sem telefone. Ela é gerada a partir de `~/projetos/curriculo` com `python3 gerar-pdf.py --sem-telefone curriculo.html <este repo>/curriculo/Gabriel-Tavares-Curriculo.pdf`.
- `ferramentas/`: fonte da imagem de compartilhamento (`og.html`) e o script que gera `assets/img/og.png`.

## Rodar localmente

Basta abrir o `index.html` no navegador. Para servir como no Pages, rode:

```bash
python3 -m http.server 8000
```

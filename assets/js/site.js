/* Gabriel Tavares · site pessoal
   Números com pastilhas (split-flap), cronômetro, pontos da segurança e revelação ao rolar.
   Sem dependências. Respeita prefers-reduced-motion. */
(() => {
  'use strict';

  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-./';
  const DIGITOS = '0123456789';
  const VAZIO = ' ';

  const fontesProntas = () => Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((ok) => setTimeout(ok, 2600)),
  ]);

  /* ---------- Topo ganha fundo ao rolar ---------- */
  const topo = document.querySelector('[data-topo]');
  const marcarTopo = () => topo && topo.classList.toggle('rolou', window.scrollY > 8);
  marcarTopo();
  window.addEventListener('scroll', marcarTopo, { passive: true });

  /* ---------- Motor das pastilhas (split-flap) ---------- */
  const fila = [];
  let rodando = false;

  // Uma pastilha por caractere; o espaço vira um respiro sem caixa.
  function criarPastilhas(destino, texto, conjunto) {
    const lista = [];
    for (const caractere of texto) {
      const el = document.createElement('span');
      if (caractere === ' ') {
        el.className = 'espaco';
        destino.appendChild(el);
        continue;
      }
      el.className = 'pastilha';
      el.textContent = VAZIO;
      destino.appendChild(el);
      lista.push({ el, alvo: caractere, conjunto });
    }
    return lista;
  }

  function mostrar(p, caractere) {
    p.el.textContent = caractere === ' ' ? VAZIO : caractere;
  }

  function animar(pastilhas, atrasoBase) {
    const agora = performance.now();
    pastilhas.forEach((p, i) => {
      if (reduz) { mostrar(p, p.alvo); return; }
      p.restam = 5 + Math.floor(Math.random() * 6);
      p.proximo = agora + atrasoBase + i * 60;
      fila.push(p);
    });
    if (!reduz && !rodando) {
      rodando = true;
      requestAnimationFrame(passo);
    }
  }

  function passo(agora) {
    for (let i = fila.length - 1; i >= 0; i--) {
      const p = fila[i];
      if (agora < p.proximo) continue;
      if (p.restam > 0) {
        const conjunto = p.conjunto || LETRAS;
        mostrar(p, conjunto[Math.floor(Math.random() * conjunto.length)]);
        p.restam -= 1;
        p.proximo = agora + 62;
      } else {
        mostrar(p, p.alvo);
        fila.splice(i, 1);
      }
      if (p.el.animate) {
        p.el.animate(
          [{ transform: 'perspective(260px) rotateX(-72deg)', filter: 'brightness(1.6)' }, { transform: 'none', filter: 'none' }],
          { duration: 120, easing: 'ease-out' }
        );
      }
    }
    if (fila.length) requestAnimationFrame(passo);
    else rodando = false;
  }

  /* ---------- Números do topo ---------- */
  const lotes = [...document.querySelectorAll('[data-flip]')].map((el) => {
    const leitura = document.createElement('span');
    leitura.className = 'so-leitor';
    leitura.textContent = el.textContent;
    const caixa = document.createElement('span');
    caixa.className = 'numero__pastilhas';
    caixa.setAttribute('aria-hidden', 'true');
    const pastilhas = criarPastilhas(caixa, el.dataset.flip);
    el.replaceChildren(leitura, caixa);
    return pastilhas;
  });
  fontesProntas().then(() => lotes.forEach((pastilhas, i) => animar(pastilhas, 200 + i * 170)));

  /* ---------- Revelação ao rolar ---------- */
  const reveladores = document.querySelectorAll('[data-revelar]');
  if ('IntersectionObserver' in window) {
    const olho = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visivel');
          olho.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveladores.forEach((el) => olho.observe(el));
  } else {
    reveladores.forEach((el) => el.classList.add('visivel'));
  }

  function quandoVisivel(el, fazer, limiar = 0.55) {
    if (!('IntersectionObserver' in window)) { fazer(); return; }
    const olho = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        olho.disconnect();
        fazer();
      }
    }, { threshold: limiar });
    olho.observe(el);
  }

  /* ---------- Cronômetro: 40:00 vira 00:03 ---------- */
  const cronometro = document.querySelector('[data-cronometro]');
  if (cronometro) {
    const de = cronometro.dataset.de;
    const para = cronometro.dataset.para;
    const pastilhas = [...de].map((c, i) => {
      const el = document.createElement('span');
      el.className = 'pastilha';
      el.textContent = c;
      cronometro.appendChild(el);
      return { el, alvo: para[i], conjunto: DIGITOS };
    });
    if (reduz) pastilhas.forEach((p) => mostrar(p, p.alvo));
    else quandoVisivel(cronometro, () => setTimeout(() => animar(pastilhas.filter((p) => p.alvo !== ':'), 0), 250));
  }

  /* ---------- Segurança: 200+ achados viram 12 causas raiz ---------- */
  const tela = document.querySelector('[data-pontos]');
  if (tela && tela.getContext) {
    const ctx = tela.getContext('2d');
    const N = 212;
    const K = 12;
    let semente = 20261110;
    const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
    const pontos = Array.from({ length: N }, (_, i) => ({
      x0: aleatorio(), y0: aleatorio(), k: i % K, jx: aleatorio() - 0.5, jy: aleatorio() - 0.5,
    }));
    let largura = 0;
    let altura = 0;
    let progresso = reduz ? 1 : 0;

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const caixa = tela.getBoundingClientRect();
      largura = caixa.width;
      altura = caixa.height;
      tela.width = Math.round(largura * dpr);
      tela.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const suavizar = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const desenhar = () => {
      ctx.clearRect(0, 0, largura, altura);
      const e = suavizar(progresso);
      const colunas = 6;
      const linhasGrade = 2;
      const espalhar = Math.min(largura / colunas, altura / linhasGrade) * 0.42;
      for (const p of pontos) {
        const cx = ((p.k % colunas) + 0.5) / colunas * largura + p.jx * espalhar;
        const cy = (Math.floor(p.k / colunas) + 0.5) / linhasGrade * altura + p.jy * espalhar;
        const x = (p.x0 * (largura - 16) + 8) * (1 - e) + cx * e;
        const y = (p.y0 * (altura - 16) + 8) * (1 - e) + cy * e;
        const r = Math.round(150 + (255 - 150) * e);
        const g = Math.round(160 + (178 - 160) * e);
        const b = Math.round(175 + (26 - 175) * e);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.5 + 0.5 * e})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    medir();
    desenhar();
    window.addEventListener('resize', () => { medir(); desenhar(); });

    if (!reduz) {
      quandoVisivel(tela, () => {
        const inicio = performance.now();
        const duracao = 1700;
        const quadro = (agora) => {
          progresso = Math.min(1, (agora - inicio) / duracao);
          desenhar();
          if (progresso < 1) requestAnimationFrame(quadro);
        };
        setTimeout(() => requestAnimationFrame(quadro), 300);
      });
    }
  }
})();

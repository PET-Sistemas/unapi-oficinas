# Portal UnAPI - Oficinas de Informatica

Site estatico para apoiar as oficinas de informatica da UnAPI UFMS. O portal reune a pagina inicial, a area de ferramentas praticas, a galeria de videos e duas atividades interativas: teclado e mouse.

## Estrutura

```text
.
├── index.html
├── ferramentas/
│   └── index.html
├── videos/
│   └── index.html
├── teclado/
│   └── index.html
├── mouse/
│   └── index.html
├── gov/
│   └── index.html
├── css/
│   ├── base.css
│   ├── home.css
│   ├── ferramentas.css
│   ├── videos.css
│   ├── teclado.css
│   ├── mouse.css
│   └── gov.css
├── js/
│   ├── teclado.js
│   ├── mouse.js
│   └── gov.js
└── img/
    └── imagens compartilhadas em WebP e SVG
```

## Como executar

Por ser um site estatico, basta abrir o arquivo `index.html` no navegador.

Se preferir servir localmente, rode um servidor simples na raiz do projeto:

```sh
python3 -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Organizacao

- `css/base.css` guarda tokens visuais, reset, fundo, navegacao comum, botoes e rodapes.
- Os arquivos `css/*.css` restantes guardam estilos especificos de cada pagina.
- `js/teclado.js` controla o destaque das teclas, tela cheia, familias de teclas e escala responsiva.
- `js/mouse.js` controla o arrastar das folhas, troca de cor, retorno por rolagem, reinicio e escala responsiva.
- `gov/` contem um mockup educativo para orientar a criacao de conta gov.br em oficina.
- `js/gov.js` controla a apresentacao passo a passo do mockup GOV.BR.
- As imagens institucionais foram convertidas para WebP para reduzir o peso do carregamento.

## Guia GOV.BR

A pagina `gov/` e um mockup educativo para apoio em oficina. Ela nao coleta dados, nao salva informacoes, nao envia formularios, nao usa cookies, nao usa `localStorage` e nao possui integracao real com servicos oficiais.

Os campos exibidos podem ser preenchidos durante a demonstracao, mas ficam apenas na tela enquanto o passo esta aberto. Ao trocar de passo ou recarregar a pagina, os valores digitados somem.

## Publicacao

O projeto pode ser publicado em qualquer hospedagem de arquivos estaticos, como GitHub Pages, Netlify ou Vercel. Nao ha etapa de build.

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
├── css/
│   ├── base.css
│   ├── home.css
│   ├── ferramentas.css
│   ├── videos.css
│   ├── teclado.css
│   └── mouse.css
├── js/
│   ├── teclado.js
│   └── mouse.js
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
- As imagens institucionais foram convertidas para WebP para reduzir o peso do carregamento.

## Publicacao

O projeto pode ser publicado em qualquer hospedagem de arquivos estaticos, como GitHub Pages, Netlify ou Vercel. Nao ha etapa de build.

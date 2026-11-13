# AutoFlow – como gerar o .exe sem instalar nada

1. Crie uma conta gratuita em github.com e clique em **New repository** (nome: `autoflow`, pode ser privado).
2. No repositório, clique em **uploading an existing file** e arraste os arquivos:
   `package.json`, `main.js`, `preload.js`, `index.html`, `renderer.js`, `style.css`.
3. Crie o workflow pelo navegador: **Add file → Create new file**, no nome digite
   `.github/workflows/build.yml` (as barras criam as pastas) e cole o conteúdo do arquivo `build.yml`.
   Clique em **Commit changes**.
4. Abra a aba **Actions**. O build "Build AutoFlow.exe" começa sozinho (leva ~3 a 5 min).
   Se não começar, clique no workflow e em **Run workflow**.
5. Quando ficar verde, clique na execução e baixe **AutoFlow** em *Artifacts* (um .zip com o `AutoFlow.exe`).
6. Extraia e dê duplo clique. É portátil: não precisa instalar.

Obs.: o Windows SmartScreen pode avisar "app desconhecido" (o exe não é assinado). Clique em
"Mais informações → Executar assim mesmo".

# Plano de Negócio do Salvee

Pasta com os documentos de negócio do Salvee (o que não é código): especificação oficial, documentos
legais, referências e exemplos. O código do app fica no resto do repositório; as regras de
desenvolvimento estão no `CLAUDE.md` da raiz.

## Estrutura

```
plano-de-negocio/
  CLAUDE.md                 # este arquivo
  docs/                     # documentos do Salvee para análise, aprovação e publicação
    Salvee-Termos-de-uso-v<versão>.pdf
    Salvee-Politica-de-privacidade-v<versão>.pdf
  referencias/              # fontes oficiais e de consulta (o que manda)
    Especificação SALVEE.pdf    # especificação funcional oficial (37 páginas)
    README.md                   # protótipo do Figma, leis e regras das lojas, com links
  exemplos/                 # modelos e documentos de outras plataformas usados como inspiração
    README.md
```

## Regras

- **Especificação oficial:** `referencias/Especificação SALVEE.pdf`. Em conflito com qualquer outro
  documento ou com o mockup do Figma, vale o PDF. As diferenças conscientes estão no `CLAUDE.md` da raiz
  e o que ainda falta em `docs/PENDENCIAS.md`.
- **Termos de uso e Política de privacidade:** o texto oficial é o do app, em `src/content/legal.ts`
  (dados da empresa e versão em `src/config/empresa.ts`). Os PDFs de `docs/` são **gerados** a partir
  dele: não editar o PDF. Mudou o texto → `npm run legal:pdf` (precisa do Chrome ou do Edge).
  Mudança relevante → subir `LEGAL_VERSION` (fica gravada no aceite de cada cadastro) e a data.
- Situação atual dos documentos legais: **rascunho v1.0**, aguardando os dados da empresa
  (razão social, CNPJ, endereço, e-mail de contato e encarregado de dados, destacados em amarelo
  nos PDFs) e revisão jurídica antes da publicação nas lojas de aplicativos.
- `exemplos/` é só consulta: nada dali vai para o app sem adaptação ao Salvee.
- Arquivos de marca (logos, ilustrações, mockups em imagem) continuam em `.Documentacao/`, porque o
  app usa alguns deles no build.
- Idioma: português (pt-BR).

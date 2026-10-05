#!/usr/bin/env node
/**
 * Controle de versão do Salvee (mesmo modelo do SIGIS).
 *
 * Fonte única: src/config/versoes.json (versão atual + histórico, mais recente primeiro).
 * O app (tela Configurações) lê esse JSON; este script gera o CHANGELOG.md a partir dele,
 * confere a consistência e mantém os package.json (raiz e server/) na mesma versão.
 *
 *   node scripts/versao.mjs check       → valida o versoes.json e os package.json (sai com erro se inválido)
 *   node scripts/versao.mjs changelog   → valida, sincroniza o "version" dos package.json e regenera
 *                                         CHANGELOG.md + o bloco "Catálogo de versões" do CLAUDE.md
 *                                         (entre os marcadores catalogo-versoes)
 *
 * Atalhos: npm run versao:check / npm run versao:changelog
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ARQ_VERSOES = resolve(RAIZ, 'src/config/versoes.json');
const ARQ_CHANGELOG = resolve(RAIZ, 'CHANGELOG.md');
const ARQ_CLAUDE_MD = resolve(RAIZ, 'CLAUDE.md');
const ARQ_PACKAGES = [resolve(RAIZ, 'package.json'), resolve(RAIZ, 'server/package.json')];

const TIPOS = {
  marco: 'Marco',
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

const parse = v => v.split('.').map(n => parseInt(n, 10));
const comparar = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

function validar(dados) {
  const erros = [];
  const { versaoAtual, historico } = dados;
  if (!/^\d+\.\d+\.\d+$/.test(versaoAtual || '')) erros.push(`versaoAtual inválida: "${versaoAtual}"`);
  if (!Array.isArray(historico) || historico.length === 0) erros.push('historico vazio');
  else {
    if (historico[0].versao !== versaoAtual) {
      erros.push(`versaoAtual (${versaoAtual}) deve ser a primeira do histórico (${historico[0].versao})`);
    }
    const vistas = new Set();
    historico.forEach((e, i) => {
      const onde = `historico[${i}] (${e.versao})`;
      if (!/^\d+\.\d+\.\d+$/.test(e.versao || '')) erros.push(`${onde}: versão inválida`);
      if (vistas.has(e.versao)) erros.push(`${onde}: versão repetida`);
      vistas.add(e.versao);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.data || '')) erros.push(`${onde}: data deve ser AAAA-MM-DD`);
      if (!TIPOS[e.tipo]) erros.push(`${onde}: tipo deve ser ${Object.keys(TIPOS).join('/')}`);
      if (!e.titulo) erros.push(`${onde}: sem título`);
      if (!Array.isArray(e.itens) || e.itens.length === 0) erros.push(`${onde}: sem itens`);
      if (i > 0) {
        const anterior = historico[i - 1];
        if (comparar(anterior.versao, e.versao) <= 0) erros.push(`${onde}: fora de ordem (deve ser menor que ${anterior.versao})`);
        if (anterior.data < e.data) erros.push(`${onde}: data posterior à da versão ${anterior.versao}`);
      }
    });
  }
  return erros;
}

const dataBR = iso => iso.split('-').reverse().join('/');

function gerarChangelog(dados) {
  const { versaoAtual, historico } = dados;
  const linhas = [];
  linhas.push('# Histórico de Versões — Salvee');
  linhas.push('');
  linhas.push('> Arquivo **gerado automaticamente** a partir de `src/config/versoes.json` ');
  linhas.push('> (`npm run versao:changelog`). Não edite à mão — edite o JSON e regenere.');
  linhas.push('');
  linhas.push(`**Versão atual: ${versaoAtual}**`);
  linhas.push('');
  linhas.push('## Como numerar (MAJOR.MINOR.PATCH)');
  linhas.push('');
  linhas.push('| Parte | Quando sobe | Exemplo | O que zera |');
  linhas.push('|---|---|---|---|');
  linhas.push('| **MAJOR** (X.0.0) | Mudança grande que altera a forma de usar ou a base do sistema: nova plataforma, troca de banco, reformulação geral, quebra de compatibilidade | 1.4.3 → **2.0.0** | MINOR e PATCH |');
  linhas.push('| **MINOR** (1.X.0) | Funcionalidade nova: novo módulo, nova tela, nova regra de negócio, nova rota da API, nova integração | 1.4.5 → **1.5.0** | PATCH |');
  linhas.push('| **PATCH** (1.4.X) | Correção de bug, ajuste visual, texto, melhoria pequena de algo que já existe, sem função nova | 1.5.0 → **1.5.1** | — |');
  linhas.push('');
  linhas.push('Várias mudanças entregues juntas viram **uma** versão, pela parte de maior peso (ex.: 1 função nova + 3 correções = MINOR).');
  linhas.push('');
  linhas.push('## Resumo');
  linhas.push('');
  linhas.push('| Versão | Data | Tipo | O que mudou | Módulos |');
  linhas.push('|---|---|---|---|---|');
  for (const e of historico) {
    linhas.push(`| **${e.versao}** | ${dataBR(e.data)} | ${TIPOS[e.tipo]} | ${e.titulo} | ${(e.modulos || []).join(', ')} |`);
  }
  linhas.push('');
  linhas.push('## Detalhes');
  for (const e of historico) {
    linhas.push('');
    linhas.push(`### ${e.versao} — ${e.titulo}`);
    linhas.push('');
    linhas.push(`*${dataBR(e.data)} · ${TIPOS[e.tipo]}${e.modulos?.length ? ` · ${e.modulos.join(', ')}` : ''}*`);
    linhas.push('');
    for (const item of e.itens) linhas.push(`- ${item}`);
    if (e.fontes?.length) {
      linhas.push('');
      linhas.push(`Fontes: ${e.fontes.map(f => (f.startsWith('git:') ? f : `\`${f}\``)).join(' · ')}`);
    }
  }
  linhas.push('');
  return linhas.join('\n');
}

// O "version" dos package.json acompanha a versaoAtual (o servidor expõe a sua em /api/health).
function lerPackage(arq) {
  const texto = readFileSync(arq, 'utf8');
  return { texto, json: JSON.parse(texto) };
}

function conferirPackages(versao) {
  return ARQ_PACKAGES
    .filter(arq => lerPackage(arq).json.version !== versao)
    .map(arq => `${arq.slice(RAIZ.length + 1)}: version ${lerPackage(arq).json.version} ≠ ${versao} (rode npm run versao:changelog)`);
}

function sincronizarPackages(versao) {
  for (const arq of ARQ_PACKAGES) {
    const { texto, json } = lerPackage(arq);
    if (json.version === versao) continue;
    // troca só a linha do version, preservando a formatação do arquivo
    writeFileSync(arq, texto.replace(/("version"\s*:\s*")[^"]*(")/, `$1${versao}$2`), 'utf8');
  }
}

// Catálogo resumido dentro do CLAUDE.md, entre os marcadores abaixo (o resto do arquivo não é tocado).
const INICIO_CATALOGO = '<!-- catalogo-versoes:inicio -->';
const FIM_CATALOGO = '<!-- catalogo-versoes:fim -->';

function atualizarCatalogoClaudeMd(dados) {
  const texto = readFileSync(ARQ_CLAUDE_MD, 'utf8');
  const ini = texto.indexOf(INICIO_CATALOGO);
  const fim = texto.indexOf(FIM_CATALOGO);
  if (ini < 0 || fim < ini) {
    console.warn('CLAUDE.md sem os marcadores do catálogo de versões — bloco não atualizado.');
    return false;
  }
  const linhas = [
    '',
    `Versão atual: **${dados.versaoAtual}** · ${dados.historico.length} versões`,
    '',
    '| Versão | Data | Tipo | O que mudou | Módulos |',
    '|---|---|---|---|---|',
    ...dados.historico.map(e =>
      `| ${e.versao} | ${dataBR(e.data)} | ${TIPOS[e.tipo]} | ${e.titulo} | ${(e.modulos || []).join(', ')} |`),
    '',
  ];
  const novo = texto.slice(0, ini + INICIO_CATALOGO.length) + '\n' + linhas.join('\n') + texto.slice(fim);
  if (novo !== texto) writeFileSync(ARQ_CLAUDE_MD, novo, 'utf8');
  return true;
}

const comando = process.argv[2] || 'check';
const dados = JSON.parse(readFileSync(ARQ_VERSOES, 'utf8'));
const erros = validar(dados);
if (erros.length) {
  console.error('versoes.json inválido:\n- ' + erros.join('\n- '));
  process.exit(1);
}

if (comando === 'changelog') {
  sincronizarPackages(dados.versaoAtual);
  writeFileSync(ARQ_CHANGELOG, gerarChangelog(dados), 'utf8');
  const claudeOk = atualizarCatalogoClaudeMd(dados);
  console.log(`CHANGELOG.md${claudeOk ? ' e catálogo do CLAUDE.md' : ''} gerados — versão atual ${dados.versaoAtual}, ${dados.historico.length} versões.`);
} else if (comando === 'check') {
  const errosPkg = conferirPackages(dados.versaoAtual);
  if (errosPkg.length) {
    console.error('package.json fora da versão:\n- ' + errosPkg.join('\n- '));
    process.exit(1);
  }
  console.log(`versoes.json ok — versão atual ${dados.versaoAtual}, ${dados.historico.length} versões.`);
} else {
  console.error(`Comando desconhecido: ${comando} (use check ou changelog)`);
  process.exit(1);
}

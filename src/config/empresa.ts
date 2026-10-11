// Dados de quem responde pelo Salvee: aparecem nos Termos de uso, na Política de privacidade,
// em Ajuda e em Sobre. Campo vazio aparece como "[... a definir]" até o cliente informar.

/** versão dos Termos/Política: mudou o texto de forma relevante, suba aqui (fica gravada no aceite do cadastro) */
export const LEGAL_VERSION = '1.0'
export const LEGAL_UPDATED_AT = '11/10/2026'

export const EMPRESA = {
  nome: 'Salvee',
  razaoSocial: '',       // ex.: Associação Salvee
  cnpj: '',
  endereco: '',          // sede (cidade/UF bastam no começo)
  emailContato: '',      // ex.: contato@salvee.org.br
  encarregado: '',       // encarregado de dados (LGPD art. 41)
  emailEncarregado: '',  // ex.: privacidade@salvee.org.br
}

/** valor do campo ou o aviso de que ainda falta */
export function campo(valor: string, rotulo: string): string {
  return valor.trim() || `[${rotulo} a definir]`
}

import type { IconName } from '@/components/ui/icon'

/**
 * Heurística simples para inferir um ícone Material Symbol a partir
 * da descrição livre do serviço. Não é perfeita — é só um ganho visual
 * sobre um ícone genérico de recibo.
 *
 * Adicione palavras-chave conforme o app for ganhando categorias.
 */
const KEYWORDS: Array<{ words: string[]; icon: IconName }> = [
  { words: ['frete', 'transporte', 'entrega', 'mudança', 'mudanca', 'caminhão', 'caminhao'], icon: 'local_shipping' },
  { words: ['eletric', 'eletro', 'fiação', 'fiacao', 'tomada', 'disjuntor', 'energia'], icon: 'electric_bolt' },
  { words: ['hidráu', 'hidrau', 'encanad', 'cano', 'vazamento', 'pia', 'esgoto', 'torneira'], icon: 'plumbing' },
  { words: ['pintur', 'pintar', 'tinta', 'fachada', 'parede'], icon: 'brush' },
  { words: ['pedreir', 'alvenaria', 'reboco', 'cimento', 'obra', 'reforma', 'construção', 'construcao'], icon: 'construction' },
  { words: ['limpez', 'faxina', 'diarista'], icon: 'cleaning_services' },
  { words: ['jardim', 'jardinagem', 'poda', 'grama'], icon: 'agriculture' },
]

export function getServiceIcon(description: string): IconName {
  const normalized = description.toLowerCase()
  for (const { words, icon } of KEYWORDS) {
    if (words.some(w => normalized.includes(w))) return icon
  }
  return 'handyman'
}

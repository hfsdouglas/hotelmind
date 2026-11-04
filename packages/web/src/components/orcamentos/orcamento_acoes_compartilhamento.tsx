import { Copy, ExternalLink, Mail, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export interface OrcamentoAcoesCompartilhamentoProps {
  token_publico: string
  lead_nome?: string
  lead_email?: string
  lead_telefone?: string
  valor_total?: string
  size?: 'sm' | 'default'
  compact?: boolean
}

export function OrcamentoAcoesCompartilhamento({
  token_publico,
  lead_nome = 'Cliente',
  lead_email,
  lead_telefone,
  valor_total,
  size = 'default',
  compact = false,
}: OrcamentoAcoesCompartilhamentoProps) {
  const publicUrl = `${window.location.origin}/orcamento/${token_publico}`

  function handleCopiarLink() {
    try {
      navigator.clipboard?.writeText?.(publicUrl)
    } catch {
      // fallback
    }
    toast.success('Link de visualização copiado para a área de transferência!')
  }

  function handleEnviarEmail() {
    if (!lead_email) {
      toast.error('Este orçamento não possui e-mail de lead cadastrado.')
      return
    }
    toast.info(
      `Simulação: A proposta foi enviada por e-mail para ${lead_email}!`
    )
  }

  function handleEnviarWhatsApp() {
    if (!lead_telefone) {
      toast.error(
        'Este orçamento não possui celular/WhatsApp de lead cadastrado.'
      )
      return
    }
    const valorInfo = valor_total ? ` no valor de R$ ${valor_total}` : ''
    toast.info(
      `Simulação: Proposta para ${lead_nome}${valorInfo} enviada via WhatsApp para ${lead_telefone}!`
    )
  }

  const btnSize = compact ? 'icon' : size

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        size={btnSize}
        className={compact ? 'h-8 w-8' : undefined}
        onClick={handleCopiarLink}
        title="Copiar link da página pública"
      >
        <Copy
          className={
            compact
              ? 'h-4 w-4 text-muted-foreground'
              : 'mr-1.5 h-4 w-4 text-muted-foreground'
          }
        />
        {!compact && 'Copiar Link'}
      </Button>

      <Button
        type="button"
        variant="outline"
        size={btnSize}
        className={compact ? 'h-8 w-8' : undefined}
        onClick={handleEnviarEmail}
        title="Simular envio por e-mail"
      >
        <Mail
          className={
            compact
              ? 'h-4 w-4 text-muted-foreground'
              : 'mr-1.5 h-4 w-4 text-muted-foreground'
          }
        />
        {!compact && 'Enviar E-mail'}
      </Button>

      <Button
        type="button"
        variant="outline"
        size={btnSize}
        className={compact ? 'h-8 w-8' : undefined}
        onClick={handleEnviarWhatsApp}
        title="Simular envio de texto no WhatsApp"
      >
        <MessageSquare
          className={
            compact
              ? 'h-4 w-4 text-muted-foreground'
              : 'mr-1.5 h-4 w-4 text-muted-foreground'
          }
        />
        {!compact && 'Enviar WhatsApp'}
      </Button>

      <Button
        type="button"
        variant="secondary"
        size={btnSize}
        className={compact ? 'h-8 w-8' : undefined}
        asChild
        title="Abrir página pública do lead"
      >
        <Link to={`/orcamento/${token_publico}`} target="_blank">
          <ExternalLink className={compact ? 'h-4 w-4' : 'mr-1.5 h-4 w-4'} />
          {!compact && 'Ver Proposta'}
        </Link>
      </Button>
    </div>
  )
}

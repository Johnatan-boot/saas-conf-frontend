// ============================================================
// SubscriptionReturnPage — /assinatura/retorno
//
// Para onde o cliente volta depois de pagar a assinatura no gateway.
// Regras:
//  1) NUNCA mostra "aprovado" só porque a URL diz sucesso: confirma no
//     servidor (Mercado Pago consulta o pagamento; Stripe/Pagar.me
//     consultam a assinatura, ativada pelo webhook).
//  2) Limpa a URL imediatamente (history.replaceState) para que um refresh
//     não reexiba mensagem de pagamento aprovado.
// ============================================================
import React, { useEffect, useState } from 'react'
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { paymentGatewayService } from '../services/paymentGatewayService'

type ViewState = 'checking' | 'approved' | 'pending' | 'failed'

const MP_STATUSES = ['approved', 'pending', 'in_process', 'rejected', 'cancelled']

export default function SubscriptionReturnPage() {
  const [state, setState] = useState<ViewState>('checking')

  useEffect(() => {
    // 1) lê os parâmetros e limpa a URL na hora
    const params = new URLSearchParams(window.location.search)
    const ourStatus = params.get('status')                       // 'sucesso' | 'cancelado' (nosso)
    const mpStatus = params.get('collection_status')
      || params.getAll('status').find(s => MP_STATUSES.includes(s)) // 'approved' etc. (Mercado Pago)
    const paymentId = params.get('payment_id') || params.get('collection_id')
    const cancelled = ourStatus === 'cancelado' || mpStatus === 'rejected' || mpStatus === 'cancelled'

    const clean = new URL(window.location.href)
    ;['status', 'ref', 'collection_id', 'collection_status', 'payment_id', 'payment_type',
      'merchant_order_id', 'preference_id', 'site_id', 'processing_mode', 'merchant_account_id',
      'external_reference', 'success', 'cancel'].forEach(k => clean.searchParams.delete(k))
    window.history.replaceState({}, '', clean.pathname + (clean.search || ''))

    if (cancelled) { setState('failed'); return }

    // 2) confirma no servidor
    let stop = false
    let tries = 0
    const check = async () => {
      try {
        const paid = paymentId && /^\d+$/.test(paymentId)
          ? (await paymentGatewayService.verifyMercadoPagoPayment(paymentId)).paid
          : (await paymentGatewayService.getSubscriptionStatus()).paid
        if (stop) return
        if (paid) { setState('approved'); return }
      } catch { /* sem sessão ou erro de rede: segue como pendente */ }
      tries++
      if (stop) return
      setState('pending')
      if (tries < 24) setTimeout(check, 5000) // ~2 min aguardando o webhook
    }
    check()
    return () => { stop = true }
  }, [])

  const content = {
    checking: { icon: <Loader2 size={48} className="animate-spin text-chocolate-500" />, title: 'Confirmando seu pagamento...', text: 'Só um instante.' },
    approved: { icon: <CheckCircle size={48} className="text-sage-600" />, title: 'Pagamento aprovado!', text: 'Seu plano está ativo e enviamos a confirmação para o seu e-mail. Já pode entrar no sistema.' },
    pending:  { icon: <Clock size={48} className="text-amber-500" />, title: 'Aguardando confirmação', text: 'Ainda não recebemos a confirmação do pagamento. PIX e alguns cartões podem levar alguns minutos. Esta tela atualiza sozinha.' },
    failed:   { icon: <XCircle size={48} className="text-red-500" />, title: 'Pagamento não concluído', text: 'O pagamento foi cancelado ou recusado. Você pode tentar novamente.' },
  }[state]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mocha-900">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-warm-lg text-center">
        <div className="flex justify-center mb-4">{content.icon}</div>
        <h1 className="font-display text-2xl font-bold text-mocha-900 mb-2">{content.title}</h1>
        <p className="text-sm text-mocha-500 mb-6">{content.text}</p>
        {state === 'approved' && <a href="/login" className="btn-primary inline-block px-6 py-3">Entrar no sistema</a>}
        {state === 'failed' && <a href="/onboard" className="btn-primary inline-block px-6 py-3">Voltar e tentar de novo</a>}
        {state === 'pending' && <a href="/login" className="text-sm text-chocolate-600 underline">Ir para o login</a>}
      </div>
    </div>
  )
}

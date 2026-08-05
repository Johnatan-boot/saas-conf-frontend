// ============================================================
// saasContract.ts
//
// Texto do Contrato de Prestação de Serviços (SaaS SweetFlow)
// exibido na etapa de cadastro, antes do pagamento do plano.
// Modelo inspirado nas cláusulas mais comuns em contratos de
// SaaS B2B no Brasil (objeto, plano/valores, pagamento, prazo,
// rescisão/desistência — art. 49 do CDC —, multa por cancelamento
// antecipado em planos anuais, LGPD, SLA e foro). Recomenda-se
// revisão por um advogado antes do uso em produção.
// ============================================================

export const CONTRACT_VERSION = '1.0'

export interface ContractClause {
  title: string
  body: string[]
}

export const CONTRACT_TITLE = 'Contrato de Prestação de Serviços SaaS — SweetFlow'

export function buildContractClauses(planName: string, planPrice: string): ContractClause[] {
  return [
    {
      title: '1. Objeto',
      body: [
        `O presente contrato regula a prestação, pela SweetFlow ("CONTRATADA"), de licença de uso do software de gestão para confeitarias SweetFlow, no modelo Software as a Service (SaaS), à confeitaria contratante ("CONTRATANTE"), conforme o plano ${planName} selecionado no ato do cadastro.`,
        'O acesso é disponibilizado remotamente, via internet, mediante login e senha pessoais e intransferíveis, não havendo transferência de propriedade do software, apenas cessão de uso.',
      ],
    },
    {
      title: '2. Plano contratado e valores',
      body: [
        `A CONTRATANTE optou pelo plano ${planName}, no valor de ${planPrice}/mês, cujos recursos e limites estão descritos na tela de planos apresentada no cadastro.`,
        'Os valores poderão ser reajustados anualmente com base na variação do IPCA (ou índice que vier a substituí-lo), mediante aviso prévio de 30 (trinta) dias.',
        'O upgrade ou downgrade de plano poderá ser solicitado a qualquer momento pela CONTRATANTE através do painel administrativo ou suporte, com cobrança proporcional (pro rata) no ciclo em curso.',
      ],
    },
    {
      title: '3. Forma de pagamento',
      body: [
        'O pagamento é processado por meio de gateways de pagamento parceiros (Stripe, Mercado Pago ou Pagar.me), à escolha da CONTRATANTE, via cartão de crédito ou PIX, conforme disponibilidade do gateway selecionado.',
        'A confirmação do pagamento é condição para a ativação (ou manutenção) do acesso pleno aos recursos do plano contratado.',
      ],
    },
    {
      title: '4. Vigência',
      body: [
        'Este contrato vigora por prazo indeterminado, renovando-se automaticamente a cada ciclo de cobrança (mensal ou o ciclo com desconto escolhido), salvo cancelamento por qualquer das partes nos termos da Cláusula 5.',
      ],
    },
    {
      title: '5. Direito de arrependimento e cancelamento',
      body: [
        'Nos termos do art. 49 do Código de Defesa do Consumidor, a CONTRATANTE poderá desistir da contratação em até 7 (sete) dias corridos a contar da confirmação do pagamento, com direito a reembolso integral do valor pago, desde que o serviço não tenha sido utilizado de forma que caracterize proveito econômico relevante.',
        'Após esse prazo, a CONTRATANTE poderá cancelar a assinatura a qualquer momento, com efeitos a partir do fim do ciclo de cobrança vigente, sem multa, para o ciclo "Mensal".',
        'Não haverá reembolso proporcional de períodos já pagos e não utilizados integralmente, ressalvado o direito de arrependimento do parágrafo acima.',
      ],
    },
    {
      title: '6. Multa por rescisão antecipada (planos com fidelidade)',
      body: [
        'Para os ciclos de cobrança com desconto e fidelidade (12, 24 ou 36 meses), o cancelamento antes do término do período contratado sujeitará a CONTRATANTE ao pagamento de multa rescisória proporcional, correspondente a 10% (dez por cento) do valor das mensalidades restantes até o fim do período contratado, a título de compensação pelo desconto concedido.',
        'A multa não será aplicada em casos de descumprimento contratual pela CONTRATADA, indisponibilidade do serviço em desacordo com o SLA (Cláusula 8), ou nas hipóteses do direito de arrependimento (Cláusula 5).',
      ],
    },
    {
      title: '7. Proteção de dados pessoais (LGPD)',
      body: [
        'As partes se comprometem a tratar os dados pessoais de clientes, colaboradores e demais titulares em conformidade com a Lei nº 13.709/2018 (LGPD), adotando medidas técnicas e administrativas aptas a proteger os dados de acessos não autorizados.',
        'A CONTRATADA atua como operadora dos dados inseridos na plataforma pela CONTRATANTE (controladora), utilizando-os exclusivamente para a prestação do serviço contratado.',
      ],
    },
    {
      title: '8. Disponibilidade do serviço (SLA)',
      body: [
        'A CONTRATADA envidará seus melhores esforços para manter disponibilidade mensal do serviço igual ou superior a 99%, ressalvadas janelas de manutenção previamente comunicadas e eventos de força maior.',
      ],
    },
    {
      title: '9. Suporte',
      body: [
        'O suporte técnico é prestado conforme os canais e prazos de atendimento descritos no plano contratado, podendo variar entre os planos Econômico, Standard e Premium.',
      ],
    },
    {
      title: '10. Propriedade intelectual',
      body: [
        'Todos os direitos de propriedade intelectual sobre o software, marca e conteúdos da plataforma SweetFlow pertencem exclusivamente à CONTRATADA, sendo vedada engenharia reversa, cópia ou redistribuição do software.',
      ],
    },
    {
      title: '11. Limitação de responsabilidade',
      body: [
        'A responsabilidade da CONTRATADA por eventuais perdas e danos decorrentes da prestação do serviço fica limitada ao valor pago pela CONTRATANTE nos 3 (três) meses anteriores ao evento, exceto nos casos de dolo ou culpa grave.',
      ],
    },
    {
      title: '12. Foro',
      body: [
        'Fica eleito o foro da comarca do domicílio da CONTRATANTE para dirimir quaisquer controvérsias decorrentes deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja, salvo disposição legal em contrário aplicável a relações de consumo.',
      ],
    },
  ]
}

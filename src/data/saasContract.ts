// ============================================================
// saasContract.ts
//
// Contrato de Prestação de Serviços SaaS — MASTERCODE / SweetFlow
// Exibido na etapa de cadastro da confeitaria, ANTES do pagamento.
//
// ⚠️ AJUSTE os dados da MASTERCODE logo abaixo (CNPJ, endereço, foro,
// e-mail) e as condições comerciais (multas, prazos). Todo o texto
// do contrato se atualiza automaticamente a partir dessas constantes.
// ⚠️ Recomenda-se revisão por advogado antes de uso em produção.
// ============================================================

export const CONTRACT_VERSION = '2.0'
export const CONTRACT_TITLE = 'Contrato de Prestação de Serviços de Software (SaaS) — Mastercode'

// ── Dados da CONTRATADA (preencha) ───────────────────────────
export const MASTERCODE = {
  razaoSocial: 'MASTERCODE',
  cnpj: '00.000.000/0001-00',              // TODO: CNPJ real
  endereco: 'Endereço completo da Mastercode, Cidade/UF', // TODO
  emailSuporte: 'suporte@mastercode.com.br', // TODO
  emailDpo: 'privacidade@mastercode.com.br', // TODO (encarregado LGPD)
  foro: 'São Paulo/SP',                     // TODO: comarca do foro
  produto: 'SweetFlow',
}

// ── Condições comerciais (ajuste livremente) ─────────────────
export const TERMS = {
  arrependimentoDias: 7,       // CDC art. 49
  multaFidelidadePct: 20,      // % sobre mensalidades vincendas (planos 12/24/36 meses)
  multaMoraPct: 2,             // multa por atraso
  jurosMoraPctMes: 1,          // juros de mora ao mês
  suspensaoDiasAtraso: 10,     // dias de atraso até suspender acesso
  cancelamentoPorInadimplenciaDias: 60, // dias até rescisão por inadimplência
  avisoPrevioDias: 30,
  slaPct: 99,
  retencaoDadosDias: 30,       // dias para exportação de dados após encerramento
  limiteResponsabilidadeMeses: 3,
}

export const CYCLE_TABLE = [
  { cycle: 'Mensal', months: 'sem fidelidade', discount: '—' },
  { cycle: '12 meses', months: '12', discount: '10%' },
  { cycle: '24 meses', months: '24', discount: '15%' },
  { cycle: '36 meses', months: '36', discount: '20%' },
]

export interface ContractClause {
  title: string
  body: string[]
}

export function buildContractClauses(planName: string, planPrice: string): ContractClause[] {
  const M = MASTERCODE
  const T = TERMS
  return [
    {
      title: 'PARTES',
      body: [
        `CONTRATADA: ${M.razaoSocial}, pessoa jurídica inscrita no CNPJ sob o nº ${M.cnpj}, com sede em ${M.endereco}, desenvolvedora e titular da plataforma ${M.produto}, doravante denominada "MASTERCODE" ou "CONTRATADA".`,
        'CONTRATANTE: a confeitaria (pessoa física ou jurídica) cujos dados constam do formulário de cadastro preenchido eletronicamente, doravante denominada "CONTRATANTE", representada pelo usuário administrador que realiza o cadastro, o qual declara ter poderes para vincular o estabelecimento.',
        'As partes resolvem firmar o presente contrato, que se aperfeiçoa mediante aceite eletrônico (clique em "Aceitar e continuar"), com plena validade jurídica nos termos do art. 107 do Código Civil e da MP 2.200-2/2001.',
      ],
    },
    {
      title: '1. Objeto',
      body: [
        `1.1. O presente contrato tem por objeto o licenciamento de uso, não exclusivo, intransferível e temporário, da plataforma de gestão para confeitarias ${M.produto}, no modelo Software as a Service (SaaS), conforme o plano ${planName} escolhido no cadastro.`,
        '1.2. O acesso é remoto, via internet, por login e senha pessoais. Não há transferência de propriedade, código-fonte ou qualquer direito além do uso previsto neste contrato.',
        '1.3. A plataforma inclui, conforme o plano: catálogo online, gestão de pedidos, produtos, clientes, painel financeiro, integrações e demais módulos descritos na tela de planos no momento da contratação.',
      ],
    },
    {
      title: '2. Plano, valores e ciclos de cobrança',
      body: [
        `2.1. A CONTRATANTE contrata o plano ${planName}, com valor de referência de ${planPrice}/mês no ciclo mensal.`,
        '2.2. Podem ser oferecidos ciclos com desconto e fidelidade, conforme a tabela vigente na contratação: Mensal (sem fidelidade); 12 meses (10% de desconto); 24 meses (15% de desconto); 36 meses (20% de desconto). O ciclo escolhido e o valor final constam no resumo do checkout e no comprovante de pagamento.',
        `2.3. Os valores poderão ser reajustados uma vez a cada 12 meses pela variação do IPCA (ou índice que o substitua), mediante aviso prévio de ${T.avisoPrevioDias} dias. Em planos com fidelidade, o preço contratado permanece fixo durante o período de fidelidade.`,
        '2.4. Upgrade de plano pode ser feito a qualquer momento, com cobrança proporcional (pro rata) do ciclo em curso. Downgrade produz efeitos a partir do próximo ciclo, e a CONTRATANTE deve adequar seus dados aos limites do plano inferior.',
        '2.5. Os valores não incluem tarifas de terceiros (taxas de gateway de pagamento, iFood, Telegram, WhatsApp, etc.), que são de responsabilidade exclusiva da CONTRATANTE.',
      ],
    },
    {
      title: '3. Pagamento, atraso e suspensão',
      body: [
        '3.1. O pagamento é processado por gateways parceiros (Stripe, Mercado Pago ou Pagar.me), por cartão de crédito ou PIX, conforme disponibilidade. A MASTERCODE não armazena dados completos de cartão.',
        '3.2. A ativação do plano depende da confirmação do pagamento. Enquanto estiver pendente, o acesso poderá ficar limitado.',
        `3.3. Em caso de atraso, incidirão multa moratória de ${T.multaMoraPct}% e juros de ${T.jurosMoraPctMes}% ao mês, calculados pro rata die, além de correção monetária.`,
        `3.4. Persistindo o atraso por mais de ${T.suspensaoDiasAtraso} dias, a MASTERCODE poderá suspender o acesso, sem prejuízo da cobrança. Após ${T.cancelamentoPorInadimplenciaDias} dias de inadimplência, o contrato poderá ser rescindido de pleno direito, aplicando-se, se for o caso, a multa da Cláusula 6.`,
        '3.5. Estornos (chargebacks) injustificados ou contestações de má-fé autorizam a suspensão imediata do acesso e a cobrança dos valores devidos e custos de gateway.',
      ],
    },
    {
      title: '4. Vigência e renovação',
      body: [
        '4.1. O contrato inicia-se na data do aceite e vigora pelo ciclo contratado, renovando-se automaticamente por períodos iguais, salvo manifestação contrária nos termos da Cláusula 5.',
        `4.2. Para cancelar a renovação automática, a CONTRATANTE deve solicitar pelo painel ou pelo e-mail ${M.emailSuporte} com antecedência mínima de ${T.avisoPrevioDias} dias do fim do ciclo vigente.`,
      ],
    },
    {
      title: '5. Direito de arrependimento e desistência',
      body: [
        `5.1. Conforme o art. 49 do Código de Defesa do Consumidor, a CONTRATANTE pode desistir da contratação em até ${T.arrependimentoDias} (sete) dias corridos contados da confirmação do primeiro pagamento, com reembolso integral do valor pago, sem multa, pelo mesmo meio de pagamento utilizado.',`.replace("',", ''),
        '5.2. Para exercer o arrependimento, basta solicitar pelo painel ou por e-mail dentro do prazo. O reembolso é processado em até 10 dias úteis, sujeito aos prazos da operadora do cartão ou gateway.',
        '5.3. Plano mensal: após o prazo de arrependimento, a CONTRATANTE pode cancelar a qualquer momento, sem multa, com acesso mantido até o fim do ciclo já pago. Não há reembolso proporcional de períodos já iniciados.',
        '5.4. Planos com fidelidade (12, 24 ou 36 meses): após o prazo de arrependimento, a desistência antes do término do período sujeita-se à multa da Cláusula 6.',
        '5.5. O direito de arrependimento é exercido uma única vez por CONTRATANTE. Uso abusivo (contratar, usar e desistir repetidamente) autoriza a MASTERCODE a recusar novas contratações.',
      ],
    },
    {
      title: '6. Multa por rescisão antecipada (planos com fidelidade)',
      body: [
        `6.1. Em caso de cancelamento, rescisão por inadimplência ou desistência pela CONTRATANTE antes do fim do período de fidelidade (12, 24 ou 36 meses), e fora do prazo de arrependimento, será devida multa compensatória de ${T.multaFidelidadePct}% (vinte por cento) sobre o valor total das mensalidades vincendas até o fim do período contratado, em razão do desconto concedido e dos investimentos de implantação e suporte.`,
        '6.2. Exemplo: plano de R$ 100,00/mês contratado por 12 meses e cancelado após 4 meses: restam 8 mensalidades (R$ 800,00); multa de 20% = R$ 160,00.',
        '6.3. A multa é exigível em até 10 dias após a rescisão, podendo ser cobrada pelos meios de pagamento cadastrados, sem prejuízo das mensalidades vencidas e não pagas.',
        '6.4. A multa não é devida quando a rescisão decorrer de: (a) descumprimento contratual grave pela MASTERCODE não sanado em 15 dias após notificação; (b) indisponibilidade do serviço em desacordo com a Cláusula 9 de forma reiterada; (c) exercício do direito de arrependimento; (d) encerramento definitivo da plataforma pela MASTERCODE.',
        '6.5. As partes reconhecem que a multa é proporcional, razoável e decorre de negociação livre, não configurando penalidade abusiva.',
      ],
    },
    {
      title: '7. Obrigações e declarações da CONTRATANTE (proteção da MASTERCODE)',
      body: [
        '7.1. A CONTRATANTE declara que as informações do cadastro são verdadeiras, que possui capacidade e poderes para contratar e que é a única responsável por manter seus dados atualizados.',
        '7.2. A CONTRATANTE é a única responsável: (a) pela guarda de login e senha e por todas as ações realizadas com suas credenciais; (b) pelo conteúdo inserido (produtos, preços, fotos, textos, dados de clientes); (c) pela qualidade, segurança alimentar, rotulagem, prazos de entrega e licenças sanitárias de seus produtos; (d) por emitir notas fiscais e cumprir obrigações fiscais, trabalhistas e tributárias do seu negócio; (e) pelo relacionamento, atendimento, cobranças, trocas e reembolsos com seus próprios clientes.',
        '7.3. A MASTERCODE é fornecedora de tecnologia e não é parte, intermediária, avalista ou corresponsável nas vendas realizadas pela CONTRATANTE a seus clientes finais, nem responde por produtos, entregas, alergias, intoxicações ou disputas entre a CONTRATANTE e seus clientes.',
        '7.4. É vedado à CONTRATANTE: (a) copiar, descompilar, fazer engenharia reversa ou tentar acessar o código-fonte; (b) revender, sublicenciar ou ceder o acesso a terceiros; (c) usar a plataforma para fins ilícitos, fraudulentos, spam ou conteúdo ofensivo; (d) sobrecarregar a infraestrutura, testar vulnerabilidades ou acessar dados de outras confeitarias; (e) usar a marca Mastercode/SweetFlow sem autorização.',
        '7.5. A violação desta cláusula autoriza a MASTERCODE a suspender ou encerrar o acesso imediatamente, sem reembolso, e a cobrar perdas e danos comprovados.',
        '7.6. A CONTRATANTE manterá a MASTERCODE indene de reclamações, ações e custos (inclusive honorários advocatícios) movidos por terceiros em razão do conteúdo, produtos ou atividades da CONTRATANTE.',
      ],
    },
    {
      title: '8. Obrigações da MASTERCODE (proteção da CONTRATANTE)',
      body: [
        '8.1. A MASTERCODE compromete-se a: (a) disponibilizar a plataforma conforme o plano contratado; (b) manter medidas razoáveis de segurança (criptografia de senhas, comunicação segura, backups periódicos e controle de acesso por confeitaria); (c) prestar suporte conforme o plano; (d) comunicar com antecedência manutenções programadas e alterações relevantes.',
        '8.2. Os dados cadastrados pela CONTRATANTE (produtos, clientes, pedidos, financeiro) são de sua exclusiva propriedade. A MASTERCODE não os venderá, nem os compartilhará com terceiros, salvo para execução do serviço (ex.: gateway de pagamento), por obrigação legal ou ordem judicial.',
        '8.3. A MASTERCODE não alterará de forma unilateral o preço do plano durante o período de fidelidade contratado, nem retirará funcionalidades essenciais do plano sem oferecer alternativa equivalente ou direito de cancelar sem multa.',
        `8.4. Mudanças relevantes neste contrato serão comunicadas com ${T.avisoPrevioDias} dias de antecedência; se não concordar, a CONTRATANTE poderá cancelar sem multa nesse prazo.`,
        '8.5. A MASTERCODE responde por falhas próprias de segurança comprovadas, nos limites da Cláusula 12.',
      ],
    },
    {
      title: '9. Disponibilidade (SLA) e suporte',
      body: [
        `9.1. A MASTERCODE empenhará seus melhores esforços para manter disponibilidade mensal de, no mínimo, ${T.slaPct}%, excluídas manutenções programadas, falhas de internet da CONTRATANTE, indisponibilidade de terceiros (hospedagem, gateways, iFood, Telegram, etc.) e casos de força maior.`,
        `9.2. O suporte técnico é prestado por e-mail (${M.emailSuporte}) e demais canais do plano, em horário comercial, com prazos que variam entre os planos Econômico, Standard e Premium.`,
        '9.3. Não são cobertos pelo suporte: treinamento extensivo, consultoria de negócio, customizações e problemas causados por uso indevido.',
      ],
    },
    {
      title: '10. Proteção de dados pessoais (LGPD)',
      body: [
        '10.1. Em relação aos dados de clientes finais inseridos na plataforma, a CONTRATANTE é a controladora e a MASTERCODE é a operadora (Lei nº 13.709/2018), tratando-os apenas conforme as instruções da CONTRATANTE e para prestar o serviço.',
        '10.2. A CONTRATANTE é responsável por ter base legal, informar seus clientes e obter os consentimentos necessários para os dados que coleta.',
        `10.3. Em relação aos dados da própria CONTRATANTE (cadastro, cobrança, logs de acesso e aceite deste contrato, incluindo IP, data/hora e navegador), a MASTERCODE atua como controladora, para execução do contrato, cumprimento legal e exercício regular de direitos. Contato do encarregado: ${M.emailDpo}.`,
        '10.4. Em caso de incidente de segurança que possa gerar risco relevante, a MASTERCODE comunicará a CONTRATANTE em prazo razoável para que sejam tomadas as medidas legais cabíveis.',
        `10.5. Após o encerramento, a CONTRATANTE terá ${T.retencaoDadosDias} dias para exportar seus dados, após os quais poderão ser excluídos, ressalvadas as informações que a lei exija manter.`,
      ],
    },
    {
      title: '11. Propriedade intelectual',
      body: [
        `11.1. O software, código-fonte, layout, banco de dados, documentação e as marcas "Mastercode" e "${M.produto}" pertencem exclusivamente à MASTERCODE. Este contrato não transfere nenhum desses direitos.`,
        '11.2. Os conteúdos inseridos pela CONTRATANTE (logos, fotos, descrições) permanecem de sua titularidade, e ela concede à MASTERCODE licença limitada apenas para hospedá-los e exibi-los na plataforma. A CONTRATANTE garante possuir direitos sobre esses conteúdos.',
      ],
    },
    {
      title: '12. Limitação de responsabilidade',
      body: [
        '12.1. A MASTERCODE não responde por lucros cessantes, perda de vendas, danos indiretos ou reputacionais, nem por prejuízos decorrentes de: uso indevido, falhas de terceiros, informações incorretas inseridas pela CONTRATANTE, perda de credenciais ou ausência de backups próprios.',
        `12.2. Salvo dolo ou culpa grave, a responsabilidade total da MASTERCODE fica limitada ao valor efetivamente pago pela CONTRATANTE nos ${T.limiteResponsabilidadeMeses} meses anteriores ao evento que originou o dano.`,
        '12.3. Nada neste contrato exclui responsabilidades que a lei não permita limitar, inclusive aquelas previstas no Código de Defesa do Consumidor quando aplicável.',
      ],
    },
    {
      title: '13. Rescisão e suspensão',
      body: [
        `13.1. Qualquer das partes pode rescindir o contrato por descumprimento da outra não sanado em 15 dias após notificação. A MASTERCODE pode suspender ou rescindir de imediato em caso de fraude, uso ilícito ou violação da Cláusula 7.4.`,
        '13.2. A rescisão não extingue obrigações vencidas, a multa da Cláusula 6 (quando aplicável), nem as cláusulas que, por natureza, devam sobreviver (propriedade intelectual, limitação de responsabilidade, confidencialidade e foro).',
      ],
    },
    {
      title: '14. Confidencialidade, força maior e disposições gerais',
      body: [
        '14.1. As partes manterão sigilo sobre informações confidenciais da outra a que tiverem acesso em razão do contrato.',
        '14.2. Nenhuma das partes responde por atrasos ou falhas decorrentes de caso fortuito ou força maior (ex.: falhas generalizadas de internet ou de provedores de nuvem, ataques cibernéticos de larga escala, atos governamentais).',
        '14.3. A tolerância quanto a qualquer descumprimento não implica novação ou renúncia. Se alguma cláusula for considerada inválida, as demais permanecem em vigor.',
        '14.4. A CONTRATANTE não pode ceder este contrato sem autorização prévia e por escrito da MASTERCODE. A MASTERCODE pode cedê-lo em caso de reorganização societária, sem prejuízo dos direitos da CONTRATANTE.',
        '14.5. Notificações serão válidas se enviadas ao e-mail cadastrado na plataforma ou exibidas no painel administrativo.',
      ],
    },
    {
      title: '15. Aceite eletrônico, registro e foro',
      body: [
        '15.1. Ao marcar a caixa de aceite e clicar em "Aceitar e continuar", a CONTRATANTE declara ter lido, compreendido e concordado com todas as cláusulas. Ficam registrados, para fins de prova: data e hora, versão do contrato, plano, endereço IP e navegador.',
        `15.2. Este contrato é regido pelas leis brasileiras. Fica eleito o foro da comarca de ${M.foro} para dirimir controvérsias, ressalvado o direito do consumidor de optar pelo foro de seu domicílio quando a lei lhe garantir essa faculdade.`,
      ],
    },
  ]
}

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { PRIMARY_CTA_CLASS } from "@/components/auth/auth-shell";

const NAV = [
  { href: "#treinamento", label: "Treinamento" },
  { href: "#nutricao", label: "Nutrição" },
  { href: "#evolucao", label: "Evolução" },
  { href: "#precos", label: "Preços" },
  { href: "#faq", label: "FAQ" },
] as const;

const PILLARS = [
  {
    icon: "/icons/dumbbell.svg",
    title: "Treinador sênior permanente",
    body: "Um algoritmo exclusivo treinado com metodologias de elite ajusta suas cargas, séries e descansos de forma adaptativa a cada set realizado.",
  },
  {
    icon: "/icons/apple.svg",
    title: "Nutricionista esportivo integrado",
    body: "Distribuição dinâmica de macronutrientes calculada precisamente sobre o gasto calórico real do seu treino. Sinergia total entre prato e barra.",
  },
  {
    icon: "/icons/trending-up.svg",
    title: "Analista de performance contínuo",
    body: "Mapeamento tridimensional de fadiga sistêmica, volume de estresse acumulado e estimativa de RM para evitar platôs e prevenir lesões.",
  },
] as const;

const PLANS = [
  {
    name: "Essencial",
    price: "R$ 49",
    blurb: "Ideal para atletas consistentes que buscam um plano de treinamento refinado com IA.",
    cta: "Começar minha evolução",
    featured: false,
    items: [
      "Plano de treino dinâmico ilimitado",
      "Ajustes adaptativos de carga semanais",
      "Métricas e estimativa de 1RM",
      "Suporte técnico via aplicativo",
    ],
  },
  {
    name: "Pro",
    price: "R$ 89",
    blurb: "Nossa experiência principal. Integração total entre sua nutrição, treino e inteligência artificial.",
    cta: "Seja um Atleta Pro",
    featured: true,
    items: [
      "Tudo do plano Essencial",
      "Nutricionista esportivo inteligente integrado",
      "Mapeamento avançado de fadiga neuromuscular",
      "Substituições inteligentes em tempo real",
      "Prioridade em novas atualizações e features",
    ],
  },
  {
    name: "Elite",
    price: "R$ 149",
    blurb: "Para atletas que buscam personalização extrema de nível competitivo internacional.",
    cta: "Assinar o Elite",
    featured: false,
    items: [
      "Tudo do plano Pro",
      "Análise biomecânica via vídeo por especialistas",
      "Modelagem metabólica personalizada profunda",
      "Acesso direto a treinadores de nível olímpico",
      "Canal exclusivo no Discord e suporte Prioritário 24/7",
    ],
  },
] as const;

const FAQ = [
  {
    q: "Como as cargas são calculadas?",
    a: "O acompanhamento usa o histórico das suas séries registradas — carga, repetições e repetições de reserva — junto com o check-in de recuperação para sugerir a faixa de carga de cada sessão. Toda alteração vem acompanhada da explicação do porquê.",
  },
  {
    q: "Preciso de algum dispositivo vestível (wearable)?",
    a: "Não é obrigatório, mas integrando relógios de monitoramento (Apple Health, Garmin, Polar) o sistema coleta dados de sono e variabilidade de frequência cardíaca de forma passiva para análises ainda mais refinadas.",
  },
  {
    q: "O plano de nutrição é restritivo?",
    a: "De forma alguma. Nosso sistema atua na distribuição flexível de macronutrientes. Criamos opções fáceis de adaptar com ingredientes tradicionais brasileiros, sugerindo as melhores fontes para o seu bolso e paladar.",
  },
  {
    q: "Posso cancelar a assinatura quando quiser?",
    a: "Sim, sem taxa de cancelamento nem prazo de fidelidade. O cancelamento é feito pelo suporte dentro do aplicativo e o acesso continua até o fim do período já pago.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Eu estava estagnado no supino reto há meses. A IA do TERVELO mudou meu tempo sob tensão e a progressão semanal calculada no milissegundo de barra me fez subir 12kg de carga real em um único macrociclo.",
    name: "Guilherme Santos",
    role: "Atleta de Crossfit e Força",
    photo: "/catalog/landing/testimonial-1.png",
  },
  {
    quote:
      "Meu dia a dia de plantão é caótico. Ter a certeza de que posso abrir o aplicativo e encontrar um treino totalmente re-adaptado de acordo com minhas poucas horas de sono salvou minha consistência física e mental.",
    name: "Dra. Camila Nogueira",
    role: "Médica Residente",
    photo: "/catalog/landing/testimonial-2.png",
  },
  {
    quote:
      "O integrador de macros é fantástico. Ele analisa o quanto me desgastei no agachamento do dia anterior e já recalcula o prato de almoço. É a primeira vez que sinto que dieta e treino estão na mesma página.",
    name: "Felipe Macedo",
    role: "Atleta Amador",
    photo: "/catalog/landing/testimonial-3.png",
  },
] as const;

function Badge({ children }: { children: string }) {
  return (
    <p className="rounded-full border border-brand bg-brand-soft px-4 py-1.5 text-[12px] font-bold uppercase text-brand">
      {children}
    </p>
  );
}

export function MarketingLanding() {
  return (
    <div className="flex w-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-6 lg:h-20 lg:px-20">
          <Link href="/" aria-label="TERVELO">
            <BrandLogo className="h-8 w-auto max-w-[160px] lg:h-10" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted lg:flex" aria-label="Seções">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-foreground">
              Entrar
            </Link>
            <Link
              href="/signup"
              className="hidden h-11 items-center rounded-[var(--radius-lg)] bg-brand px-5 text-sm font-bold text-on-brand shadow-md sm:inline-flex"
            >
              Experimentar Grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-[1440px] items-center gap-10 px-6 pb-16 pt-10 lg:grid-cols-2 lg:gap-8 lg:px-20 lg:pb-24 lg:pt-20">
          <div className="flex flex-col items-start gap-6 lg:gap-8">
            <Badge>Plataforma de Alta Performance</Badge>
            <div className="flex flex-col gap-4">
              <h1 className="text-[32px] font-extrabold leading-tight text-foreground lg:text-[56px] lg:leading-[64px]">
                Treinamento inteligente.
                <br />
                Evolução contínua.
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted lg:text-lg">
                O TERVELO reúne treinamento de força, recuperação e nutrição esportiva num acompanhamento
                só. Você registra cada série, e o plano é revisto a partir do que os seus dados mostram.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-[52px] w-auto items-center justify-center rounded-[var(--radius-lg)] bg-brand px-7 text-[15px] font-bold text-on-brand shadow-md"
              >
                Começar minha evolução
              </Link>
              <a href="#treinamento" className="inline-flex items-center gap-2 text-[15px] font-semibold text-brand">
                Conhecer como funciona
                <FigmaIcon src="/icons/chevron-right.svg" alt="" size={16} />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex">
                {["1", "2", "3", "4"].map((id, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={id}
                    src={`/catalog/landing/avatar-${id}.png`}
                    alt=""
                    width={36}
                    height={36}
                    className={`size-9 rounded-full border-2 border-background object-cover ${index === 0 ? "" : "-ml-3"}`}
                  />
                ))}
              </div>
              <p className="text-[13px] text-muted">
                <span className="font-bold text-foreground">Mais de 14.000</span> atletas treinando hoje com
                inteligência artificial.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[24px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/catalog/landing/hero.webp"
              alt="Academia com acompanhamento TERVELO"
              width={1152}
              height={896}
              className="h-auto w-full object-cover"
            />
            <article className="absolute bottom-4 left-4 right-4 flex max-w-[320px] flex-col gap-3 rounded-[var(--radius-xl)] border border-border bg-surface/90 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold uppercase text-brand">Próximo Bloco</p>
                <span className="rounded-[var(--radius-md)] bg-success/20 px-2 py-1 text-[11px] font-bold text-success">
                  Recuperação: 94%
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">Força Reativa & Potência</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Carga de trabalho total</span>
                <span className="font-bold text-foreground">14.850 kg</span>
              </div>
            </article>
          </div>
        </section>

        <section className="bg-background-secondary px-6 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10">
            <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
              <Badge>Pilares do Sistema</Badge>
              <h2 className="text-[28px] font-extrabold text-foreground lg:text-[40px]">
                Sua assessoria esportiva completa, sem limites
              </h2>
              <p className="text-base text-muted">
                Chega de planilhas estáticas e palpites. O ecossistema inteligente TERVELO gerencia cada
                aspecto do seu rendimento físico.
              </p>
            </div>
            <div className="grid w-full gap-6 lg:grid-cols-3">
              {PILLARS.map((pillar) => (
                <article
                  key={pillar.title}
                  className="flex flex-col gap-5 rounded-[20px] border border-border bg-surface p-8"
                >
                  <span className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-brand-soft text-brand">
                    <FigmaIcon src={pillar.icon} alt="" size={24} />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-foreground">{pillar.title}</h3>
                    <p className="text-sm leading-[22px] text-muted">{pillar.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="treinamento" className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-16 lg:px-20 lg:py-24">
          <Badge>Tecnologia de Carga</Badge>
          <h2 className="max-w-3xl text-[28px] font-extrabold text-foreground lg:text-[40px]">
            Treinamento que evolui com você
          </h2>
          <p className="max-w-3xl text-base leading-[26px] text-muted">
            O corpo humano não evolui de forma linear. Por que o seu treino deveria? Nosso sistema adapta os
            estímulos de acordo com as flutuações diárias de energia, estresse e sono, maximizando a resposta
            adaptativa.
          </p>
        </section>

        <section id="nutricao" className="bg-background-secondary px-6 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">
            <Badge>Nutrição Integrada</Badge>
            <h2 className="max-w-3xl text-[28px] font-extrabold text-foreground lg:text-[40px]">
              Nutrição esportiva personalizada
            </h2>
            <p className="max-w-3xl text-base leading-[26px] text-muted">
              Não existe treino eficiente com nutrição desalinhada. O TERVELO integra o cálculo exato das suas
              demandas energéticas pós-treino, construindo cardápios dinâmicos baseados no volume real de
              estresse muscular daquela sessão.
            </p>
          </div>
        </section>

        <section id="evolucao" className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-16 lg:px-20 lg:py-24">
          <Badge>Analytics e Metas</Badge>
          <h2 className="text-[28px] font-extrabold text-foreground lg:text-[40px]">Visualize cada progresso</h2>
          <p className="max-w-3xl text-base text-muted">
            Métricas de força bruta, volume acumulado e densidade de trabalho explicadas em gráficos limpos e
            acionáveis.
          </p>
        </section>

        <section id="precos" className="bg-background-secondary px-6 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10">
            <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
              <Badge>Preço Justo, Sem Fidelidade</Badge>
              <h2 className="text-[28px] font-extrabold text-foreground lg:text-[40px]">
                Investimento estruturado para o seu corpo
              </h2>
              <p className="text-base text-muted">
                Escolha o nível de acompanhamento ideal para sua rotina esportiva. Cancele quando quiser.
              </p>
            </div>
            <div className="grid w-full gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <article
                  key={plan.name}
                  className={`flex flex-col gap-6 rounded-[20px] border p-8 ${
                    plan.featured ? "border-brand bg-surface" : "border-border bg-surface"
                  }`}
                >
                  {plan.featured ? (
                    <p className="text-[11px] font-bold uppercase text-brand">Mais procurado</p>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted">{plan.blurb}</p>
                    <p className="pt-2 text-3xl font-extrabold text-foreground">
                      {plan.price}
                      <span className="text-base font-medium text-muted">/mês</span>
                    </p>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground">
                        <FigmaIcon src="/icons/check.svg" alt="" size={14} className="mt-0.5 text-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={
                      plan.featured
                        ? `${PRIMARY_CTA_CLASS} mt-auto`
                        : "mt-auto inline-flex h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-border text-[15px] font-semibold text-foreground"
                    }
                  >
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-10 px-6 py-16 lg:px-20 lg:py-24">
          <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
            <Badge>Opinião de Atletas</Badge>
            <h2 className="text-[28px] font-extrabold text-foreground lg:text-[40px]">
              Histórias de quem treina com dados
            </h2>
          </div>
          <div className="grid w-full gap-6 lg:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                className="flex flex-col gap-6 rounded-[20px] border border-border bg-surface p-8"
              >
                <p className="text-[15px] leading-6 text-foreground">“{item.quote}”</p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.photo}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="bg-background-secondary px-6 py-16 lg:px-20 lg:py-24">
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col items-start gap-4">
              <Badge>Tire suas dúvidas</Badge>
              <h2 className="text-[28px] font-extrabold text-foreground lg:text-[40px]">Perguntas Frequentes</h2>
              <p className="text-base leading-6 text-muted">
                Tem alguma pergunta específica sobre a nossa metodologia científica ou integrador artificial?
                Confira as respostas rápidas ao lado.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="rounded-[var(--radius-xl)] border border-border bg-surface px-5 py-4"
                >
                  <summary className="cursor-pointer list-none text-sm font-bold text-foreground">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-6 px-6 py-16 text-center lg:px-20 lg:py-24">
          <h2 className="max-w-3xl text-[28px] font-extrabold text-foreground lg:text-[40px]">
            Assuma o controle total do seu rendimento físico
          </h2>
          <p className="max-w-2xl text-base text-muted">
            Em apenas 12 semanas, nosso algoritmo reorganizará sua capacidade de força, volume metabólico e
            relação com a balança de forma definitiva.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-[52px] w-auto max-w-xs items-center justify-center rounded-[var(--radius-lg)] bg-brand px-7 text-base font-bold text-on-brand shadow-md"
          >
            Criar minha conta
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 lg:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 text-sm text-muted lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 TERVELO Technologies Inc. Todos os direitos reservados.</p>
          <p className="flex gap-3">
            <Link href="/termos" className="hover:text-foreground">
              Termos de Serviço
            </Link>
            <Link href="/privacidade" className="hover:text-foreground">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

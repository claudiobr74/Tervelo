import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Política de Privacidade — TERVELO" };

export default function PrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      updatedAt="27 de agosto de 2026"
      sections={[
        {
          heading: "Dados que coletamos",
          body: "Nome, e-mail e as respostas que você fornece sobre treino, medidas corporais, recuperação e alimentação. Se você conectar um frequencímetro, também coletamos os batimentos durante a sessão.",
        },
        {
          heading: "Para que usamos",
          body: "Para montar e ajustar seu acompanhamento, mostrar sua evolução e melhorar as recomendações. Não vendemos seus dados.",
        },
        {
          heading: "Onde ficam",
          body: "Os dados ficam no seu aparelho enquanto você está sem conexão e são sincronizados com nosso backend assim que a rede volta. O acesso é restrito à sua própria conta.",
        },
        {
          heading: "Seus direitos",
          body: "Você pode consultar, corrigir e apagar seus dados, além de pedir uma cópia. As informações de perfil ficam em Mais → Dados pessoais.",
        },
        {
          heading: "Retenção",
          body: "Mantemos seus dados enquanto a conta existir. Ao encerrar a conta, o histórico é removido dentro do prazo previsto em lei.",
        },
        {
          heading: "Contato",
          body: "Pedidos relacionados a privacidade podem ser enviados pelo suporte dentro do aplicativo.",
        },
      ]}
    />
  );
}

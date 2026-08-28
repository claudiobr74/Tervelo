import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Termos de Serviço — TERVELO" };

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de Serviço"
      updatedAt="27 de agosto de 2026"
      sections={[
        {
          heading: "Do que se trata",
          body: "O TERVELO é uma plataforma de acompanhamento de treinamento de força e nutrição esportiva. Ao criar uma conta, você concorda com estes termos.",
        },
        {
          heading: "Sua conta",
          body: "Você é responsável por manter a senha em segurança e pelas atividades feitas na sua conta. Avise-nos se identificar uso indevido.",
        },
        {
          heading: "Uso da plataforma",
          body: "O conteúdo apresentado é orientação de treinamento e nutrição esportiva. Não substitui avaliação médica, diagnóstico ou tratamento. Interrompa o exercício e procure um profissional de saúde diante de qualquer sintoma.",
        },
        {
          heading: "Assinatura e cancelamento",
          body: "Planos pagos são cobrados de forma recorrente e podem ser cancelados a qualquer momento pelo próprio aplicativo, sem multa. O acesso permanece disponível até o fim do período já pago.",
        },
        {
          heading: "Encerramento",
          body: "Você pode encerrar sua conta quando quiser. Podemos suspender contas que violem estes termos ou coloquem outras pessoas em risco.",
        },
        {
          heading: "Contato",
          body: "Dúvidas sobre estes termos podem ser enviadas pelo suporte dentro do aplicativo.",
        },
      ]}
    />
  );
}

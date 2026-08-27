import Link from "next/link";

export const metadata = { title: "Página não encontrada — TERVELO" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-3 px-6 py-16">
      <h1 className="text-xl font-semibold">Página não encontrada</h1>
      <p className="text-sm text-muted">O endereço não existe neste app.</p>
      <Link href="/" className="text-sm font-semibold text-brand">
        Voltar para a página inicial
      </Link>
    </main>
  );
}

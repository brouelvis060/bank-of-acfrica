import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ecommerce CI</h1>
        <nav className="space-x-4">
          <Link className="hover:underline" href="/catalogue">Catalogue</Link>
          <Link className="hover:underline" href="/panier">Panier</Link>
          <Link className="hover:underline" href="/admin">Admin</Link>
        </nav>
      </header>

      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-2 text-xl font-semibold">Bienvenue</h2>
        <p>
          Boutique en ligne optimisée pour la Côte d'\Ivoire avec calcul de livraison dynamique.
        </p>
      </section>
    </main>
  );
}


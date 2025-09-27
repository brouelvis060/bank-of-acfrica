import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CataloguePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Catalogue</h1>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {products.map(p => (
          <li key={p.id} className="rounded bg-white p-4 shadow">
            <div className="h-40 w-full rounded bg-gray-100" />
            <h3 className="mt-3 font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.description}</p>
            <p className="mt-2 font-bold">{new Intl.NumberFormat('fr-FR').format(p.price)} FCFA</p>
            <button className="mt-3 rounded bg-blue-600 px-3 py-1 text-white">Ajouter au panier</button>
          </li>
        ))}
      </ul>
      <Link className="text-blue-600 hover:underline" href="/panier">Aller au panier</Link>
    </main>
  );
}


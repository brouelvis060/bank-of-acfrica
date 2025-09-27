import Link from 'next/link';

export default function CartPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panier</h1>
      <p>Votre panier est vide pour l'instant.</p>
      <Link className="text-blue-600 hover:underline" href="/paiement">Passer au paiement</Link>
    </main>
  );
}


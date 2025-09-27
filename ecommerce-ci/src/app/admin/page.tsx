import Link from 'next/link';

export default function AdminHome() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <ul className="list-disc pl-6">
        <li>
          <Link className="text-blue-600 hover:underline" href="/admin/produits">Gérer les produits</Link>
        </li>
        <li>
          <Link className="text-blue-600 hover:underline" href="/admin/villes">Villes et communes</Link>
        </li>
      </ul>
    </main>
  );
}


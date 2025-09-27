"use client";
import { useEffect, useState } from 'react';

type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<ProductInput>({ name: '', description: '', price: 0, stock: 0 });

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {});
  }, []);

  async function addProduct() {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const p = await res.json();
      setProducts(prev => [p, ...prev]);
      setForm({ name: '', description: '', price: 0, stock: 0 });
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Produits</h1>

      <div className="rounded bg-white p-4 shadow space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input className="mt-1 w-full rounded border p-2" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium">Prix (FCFA)</label>
            <input type="number" className="mt-1 w-full rounded border p-2" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea className="mt-1 w-full rounded border p-2" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium">Stock</label>
            <input type="number" className="mt-1 w-full rounded border p-2" value={form.stock} onChange={e=>setForm({...form, stock:Number(e.target.value)})} />
          </div>
        </div>
        <button onClick={addProduct} className="rounded bg-blue-600 px-4 py-2 text-white">Ajouter</button>
      </div>

      <ul className="divide-y rounded bg-white shadow">
        {products.map(p => (
          <li key={p.id} className="p-3 flex justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.description}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{new Intl.NumberFormat('fr-FR').format(p.price)} FCFA</div>
              <div className="text-sm text-gray-600">Stock: {p.stock}</div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


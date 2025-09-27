"use client";
import { useEffect, useState } from 'react';

type City = { id: string; name: string; isAbidjan: boolean; isPeri: boolean };

export default function AdminCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState('');
  const [isAbidjan, setIsAbidjan] = useState(false);
  const [isPeri, setIsPeri] = useState(false);

  useEffect(() => {
    fetch('/api/cities').then(r => r.json()).then(setCities).catch(() => {});
  }, []);

  async function addCity() {
    const res = await fetch('/api/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, isAbidjan, isPeri })
    });
    if (res.ok) {
      const city = await res.json();
      setCities(prev => [city, ...prev]);
      setName(''); setIsAbidjan(false); setIsPeri(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Villes</h1>
      <div className="rounded bg-white p-4 shadow space-y-3">
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input className="mt-1 w-full rounded border p-2" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="flex items-center gap-6">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={isAbidjan} onChange={e=>setIsAbidjan(e.target.checked)} /> Abidjan</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={isPeri} onChange={e=>setIsPeri(e.target.checked)} /> Péri-urbain</label>
        </div>
        <button onClick={addCity} className="rounded bg-blue-600 px-4 py-2 text-white">Ajouter</button>
      </div>

      <ul className="divide-y rounded bg-white shadow">{
        cities.map(c => (
          <li key={c.id} className="p-3 flex justify-between">
            <span>{c.name}</span>
            <span className="text-sm text-gray-600">{c.isAbidjan ? 'Abidjan' : c.isPeri ? 'Péri-urbain' : 'National'}</span>
          </li>
        ))
      }</ul>
    </main>
  );
}


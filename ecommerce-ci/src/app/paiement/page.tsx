"use client";
import { useEffect, useMemo, useState } from 'react';

type ShippingTier = 'ABIDJAN' | 'PERI_URBAIN' | 'NATIONAL';

const PERI_URBAIN_VILLES = new Set(['Anyama', 'Bingerville', 'Songon']);

export default function CheckoutPage() {
  const [ville, setVille] = useState('');
  const [commune, setCommune] = useState('');

  const tier: ShippingTier | null = useMemo(() => {
    if (!ville) return null;
    if (ville.toLowerCase() === 'abidjan') return 'ABIDJAN';
    if (PERI_URBAIN_VILLES.has(capitalize(ville))) return 'PERI_URBAIN';
    return 'NATIONAL';
  }, [ville]);

  const shippingPrice = useMemo(() => {
    if (!tier) return 0;
    if (tier === 'ABIDJAN') return 1500;
    if (tier === 'PERI_URBAIN') return 2200;
    return 3000;
  }, [tier]);

  useEffect(() => {
    if (tier !== 'ABIDJAN') setCommune('');
  }, [tier]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Paiement</h1>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Ville</label>
          <input
            className="mt-1 w-full rounded border border-gray-300 p-2"
            placeholder="Ex: Abidjan, Anyama, Korhogo..."
            value={ville}
            onChange={(e) => setVille(e.target.value)}
          />
        </div>

        {tier === 'ABIDJAN' && (
          <div>
            <label className="block text-sm font-medium">Commune (Abidjan)</label>
            <select
              className="mt-1 w-full rounded border border-gray-300 p-2"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
            >
              <option value="">Sélectionner une commune</option>
              {ABIDJAN_COMMUNES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Frais de livraison estimés</p>
          <p className="text-2xl font-semibold">{formatFcfa(shippingPrice)} FCFA</p>
          {tier && (
            <p className="text-xs text-gray-500">{labelForTier(tier)}</p>
          )}
        </div>

        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Payer (simulation)
        </button>
      </form>
    </main>
  );
}

function formatFcfa(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function labelForTier(t: ShippingTier) {
  if (t === 'ABIDJAN') return 'Livraison Abidjan';
  if (t === 'PERI_URBAIN') return 'Livraison Anyama/Bingerville/Songon';
  return 'Expédition nationale';
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const ABIDJAN_COMMUNES = [
  'Abobo',
  'Adjamé',
  'Anyama',
  'Attécoubé',
  'Bingerville',
  'Cocody',
  'Koumassi',
  'Marcory',
  'Plateau',
  'Port-Bouët',
  'Songon',
  'Treichville',
  'Yopougon',
];


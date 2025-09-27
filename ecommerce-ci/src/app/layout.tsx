import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecommerce CI',
  description: 'Boutique en ligne avec livraison dynamique en Côte d\'Ivoire',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}


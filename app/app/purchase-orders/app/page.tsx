// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Pharmacy Purchase Order App</h1>
      <p className="text-lg text-gray-600 mb-6">
        Manage all your vendors, POs, and inventory easily.
      </p>
      <Link href="/purchase-orders">
        <Button>Go to Purchase Orders</Button>
      </Link>
    </div>
  );
}

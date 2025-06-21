
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Package, 
  Users, 
  FileText, 
  BarChart3, 
  Warehouse,
  Upload
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AERO-CHEM Neutron - Pharmacy Management System',
  description: 'Comprehensive pharmacy purchase order management system with GST calculations and pharmaceutical-specific features for AERO-CHEM Neutron',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                  <Link href="/" className="flex items-center space-x-4">
                    <div className="relative h-12 w-12">
                      <Image
                        src="/aerochem-logo.png"
                        alt="AERO-CHEM Neutron Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">
                        AERO-CHEM Neutron
                      </h1>
                      <p className="text-sm text-gray-600">Pharmacy Management System</p>
                    </div>
                  </Link>
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link
                      href="/"
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/purchase-orders"
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                    <Link
                      href="/products"
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      <span>Products</span>
                    </Link>
                    <Link
                      href="/inventory"
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Warehouse className="h-4 w-4" />
                      <span>Inventory</span>
                    </Link>
                    <Link
                      href="/suppliers"
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      <span>Suppliers</span>
                    </Link>
                    <Link
                      href="/purchase-orders/new"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      New Order
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white border-t mt-16">
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex items-start space-x-4">
                    <div className="relative h-10 w-10 flex-shrink-0">
                      <Image
                        src="/aerochem-logo.png"
                        alt="AERO-CHEM Neutron Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">AERO-CHEM Neutron</h3>
                      <p className="text-sm text-gray-600">
                        Advanced Pharmacy Management System
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>803/B, Synergy Tower, Nr. Vodafone House</p>
                      <p>Corporate Road, Prahlad Nagar</p>
                      <p>Ahmedabad-380054, Gujarat</p>
                      <p>Email: purchase@aerochem.in</p>
                      <p>Phone: 079-40067800</p>
                      <p>GST: 24AAMPC2680E1Z1</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>SHED NO. D-99, BLOCK NO. 351 PAIKI 1</p>
                      <p>TULSI ESTATE AND PLAZA</p>
                      <p>CHANGODAR - 382220</p>
                      <p>TALUKA: SANAND</p>
                      <p>DISTRICT: AHMEDABAD-RURAL</p>
                    </div>
                  </div>
                </div>
                <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
                  <p>&copy; 2025 AERO-CHEM Neutron. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

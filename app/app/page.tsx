
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Warehouse,
  Calendar,
  Upload,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LowStockAlert } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalOrders: number;
  draftOrders: number;
  submittedOrders: number;
  completedOrders: number;
  totalValue: number;
  activeSuppliers: number;
  activeProducts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    draftOrders: 0,
    submittedOrders: 0,
    completedOrders: 0,
    totalValue: 0,
    activeSuppliers: 0,
    activeProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
    fetchLowStockAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await fetch('/api/inventory/low-stock');
      if (response.ok) {
        const data = await response.json();
        setLowStockAlerts(data.slice(0, 5)); // Show only top 5 alerts
      }
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Draft Orders',
      value: stats.draftOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Submitted Orders',
      value: stats.submittedOrders,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Value',
      value: `₹${stats.totalValue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Suppliers',
      value: stats.activeSuppliers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: Package,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section with Branding */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl"></div>
        <div className="relative p-12">
          <div className="flex justify-center mb-6">
            <div className="relative h-20 w-20">
              <Image
                src="/aerochem-logo.png"
                alt="AERO-CHEM Neutron Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AERO-CHEM Neutron Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Advanced pharmaceutical procurement management with comprehensive order tracking, 
            GST calculations, inventory management, and supplier coordination for modern pharmacy operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/purchase-orders/new">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-5 w-5" />
                Create New Purchase Order
              </Button>
            </Link>
            <Link href="/products/bulk-upload">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Upload className="mr-2 h-5 w-5" />
                Bulk Upload Products
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Essential tools for managing your pharmaceutical operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Link href="/purchase-orders/new">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:shadow-md transition-all">
                  <Plus className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">New Purchase Order</span>
                </Button>
              </Link>
              <Link href="/suppliers">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:shadow-md transition-all">
                  <Users className="h-6 w-6 text-indigo-600" />
                  <span className="text-sm">Manage Suppliers</span>
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:shadow-md transition-all">
                  <Package className="h-6 w-6 text-teal-600" />
                  <span className="text-sm">Manage Products</span>
                </Button>
              </Link>
              <Link href="/inventory">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:shadow-md transition-all">
                  <Warehouse className="h-6 w-6 text-purple-600" />
                  <span className="text-sm">Inventory Dashboard</span>
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:shadow-md transition-all">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </Link>
              <Link href="/products/bulk-upload">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:shadow-md transition-all border-orange-200 hover:border-orange-300">
                  <Upload className="h-6 w-6 text-orange-600" />
                  <span className="text-sm">Bulk Upload</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="border-yellow-200 bg-yellow-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Products that need immediate attention for restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockAlerts.map((alert, index) => (
                  <div key={alert.product.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{alert.product.name}</h4>
                      <p className="text-sm text-gray-600">{alert.product.composition}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="text-red-600 font-medium">
                          Current: {alert.currentStock} units
                        </span>
                        <span className="text-gray-600">
                          Min: {alert.minStockLevel} units
                        </span>
                        {alert.daysUntilStockOut && (
                          <span className="text-orange-600">
                            ~{alert.daysUntilStockOut} days left
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Stock Level</div>
                        <Progress 
                          value={alert.stockPercentage} 
                          className="w-20 h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {alert.stockPercentage}%
                        </div>
                      </div>
                      <Badge variant={alert.currentStock === 0 ? 'destructive' : 'secondary'}>
                        {alert.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/inventory">
                  <Button variant="outline" size="sm">
                    View All Inventory
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Purchase Orders
                </CardTitle>
                <CardDescription>
                  Latest purchase orders in your system
                </CardDescription>
              </div>
              <Link href="/purchase-orders">
                <Button variant="outline" size="sm">
                  View All Orders
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No purchase orders yet</p>
                <p className="text-sm">Create your first order to get started with AERO-CHEM Neutron!</p>
                <Link href="/purchase-orders/new" className="mt-4 inline-block">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Order
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="font-medium">{order.orderNumber}</p>
                        <Badge variant={order.status === 'DRAFT' ? 'secondary' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.supplier?.name}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                        <span>{order.items?.length || 0} items</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {(order.status === 'DRAFT' || order.status === 'SUBMITTED') && (
                          <Link href={`/purchase-orders/${order.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        )}
                        <Link href={`/purchase-orders/${order.id}/view`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

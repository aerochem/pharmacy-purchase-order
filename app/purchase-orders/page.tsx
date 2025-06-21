
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Plus, 
  Edit, 
  Download, 
  Search,
  FileText,
  Calendar,
  Building2,
  Filter,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PurchaseOrder, PurchaseOrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PurchaseOrdersPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  useEffect(() => {
    let filtered = purchaseOrders.filter(order => {
      const matchesSearch = 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchTerm, statusFilter]);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/purchase-orders');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const processedData = data.map((order: any) => ({
          ...order,
          orderDate: new Date(order.orderDate),
          expectedDate: order.expectedDate ? new Date(order.expectedDate) : null,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt)
        }));
        setPurchaseOrders(processedData);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchase orders",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = async (order: PurchaseOrder) => {
    try {
      setIsLoading(true);
      
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your purchase order PDF...",
      });

      const response = await fetch('/api/purchase-orders/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/html')) {
          // Get HTML content and open in new window for printing
          const htmlContent = await response.text();
          
          // Create a new window with the HTML content
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            
            // Wait for content to load then trigger print
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
                // Close window after printing (user can cancel)
                printWindow.onafterprint = () => {
                  printWindow.close();
                };
              }, 500);
            };
            
            toast({
              title: "PDF Ready",
              description: "Print dialog opened. You can save as PDF from the print options.",
            });
          } else {
            throw new Error('Unable to open print window. Please check popup blockers.');
          }
        } else if (contentType && contentType.includes('application/pdf')) {
          // Handle actual PDF response (fallback)
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `PO_${order.orderNumber}.pdf`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          toast({
            title: "Success",
            description: "PDF downloaded successfully!",
          });
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case PurchaseOrderStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case PurchaseOrderStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case PurchaseOrderStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case PurchaseOrderStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      case PurchaseOrderStatus.CANCELLED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600 mt-2">
              View, edit, and manage all your purchase orders
            </p>
          </div>
          <Link href="/purchase-orders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Purchase Order
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order number or supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.SUBMITTED}>Submitted</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.APPROVED}>Approved</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={PurchaseOrderStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center text-sm text-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                {filteredOrders.length} of {purchaseOrders.length} orders
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Purchase Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No orders match your search criteria.' 
                  : 'Get started by creating your first purchase order.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/purchase-orders/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Order
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 mr-2" />
                            <span>{order.supplier?.name || 'Unknown Supplier'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(order.orderDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{order.items?.length || 0} items</span>
                          </div>
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                        </div>

                        {order.expectedDate && (
                          <div className="mt-2 text-sm text-gray-600">
                            Expected delivery: {formatDate(order.expectedDate)}
                          </div>
                        )}

                        {order.comments && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Comments:</span> {order.comments}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/purchase-orders/${order.id}/view`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(order.status === PurchaseOrderStatus.DRAFT || order.status === PurchaseOrderStatus.SUBMITTED) && (
                          <Link href={`/purchase-orders/${order.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPDF(order)}
                          disabled={isLoading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

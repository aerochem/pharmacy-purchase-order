
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Supplier, PAYMENT_TERMS } from '@/lib/types';

export default function SuppliersPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    paymentTerms: '',
    isActive: true
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: '',
      paymentTerms: '',
      isActive: true
    });
    setEditingSupplier(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingSupplier 
        ? `/api/suppliers/${editingSupplier.id}`
        : '/api/suppliers';
      
      const method = editingSupplier ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Supplier ${editingSupplier ? 'updated' : 'created'} successfully`
        });
        setIsDialogOpen(false);
        resetForm();
        fetchSuppliers();
      } else {
        throw new Error('Failed to save supplier');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingSupplier ? 'update' : 'create'} supplier`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      gstNumber: supplier.gstNumber || '',
      paymentTerms: supplier.paymentTerms || '',
      isActive: supplier.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully"
        });
        fetchSuppliers();
      } else {
        throw new Error('Failed to delete supplier');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive"
      });
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Suppliers</h1>
            <p className="text-gray-600 mt-2">
              Add, edit, and manage your pharmaceutical suppliers
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier 
                    ? 'Update supplier information below.'
                    : 'Enter the details for the new supplier below.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Supplier Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      value={formData.paymentTerms}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TERMS.map(term => (
                          <SelectItem key={term} value={term}>{term}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suppliers by name, contact person, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suppliers Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No suppliers match your search criteria.' : 'Get started by adding your first supplier.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Supplier
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        {supplier.contactPerson && (
                          <CardDescription>{supplier.contactPerson}</CardDescription>
                        )}
                      </div>
                      <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supplier.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {supplier.email}
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {supplier.phone}
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    )}
                    {supplier.gstNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        GST: {supplier.gstNumber}
                      </div>
                    )}
                    {supplier.paymentTerms && (
                      <div className="text-sm text-gray-600">
                        <strong>Payment:</strong> {supplier.paymentTerms}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(supplier.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

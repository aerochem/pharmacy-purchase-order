
'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  Save,
  X,
  Package,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface ProductRow {
  rowIndex: number;
  productName: string;
  genericName: string;
  composition: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  status: 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  isValid: boolean;
  errors: string[];
  isExisting?: boolean;
  existingId?: string;
}

interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  existingProducts: number;
  newProducts: number;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ProductRow[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setUploadResult(null);
      setParsedData([]);
      setValidationSummary(null);
      setShowPreview(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setUploadResult(null);
      setParsedData([]);
      setValidationSummary(null);
      setShowPreview(false);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please drop a CSV file.",
        variant: "destructive",
      });
    }
  };

  const parseAndValidateCSV = async () => {
    if (!file) return;

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/bulk-upload/validate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to validate CSV file');
      }

      const result = await response.json();
      setParsedData(result.data);
      setValidationSummary(result.summary);
      setShowPreview(true);
      setUploadProgress(100);

      toast({
        title: "CSV Validation Complete",
        description: `${result.summary.validRows} valid rows, ${result.summary.invalidRows} invalid rows`,
      });
    } catch (error) {
      console.error('Error validating CSV:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!parsedData.length || !validationSummary) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const validRows = parsedData.filter(row => row.isValid);
      
      const response = await fetch('/api/products/bulk-upload/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: validRows }),
      });

      if (!response.ok) {
        throw new Error('Failed to process bulk upload');
      }

      const result = await response.json();
      setUploadResult(result);
      setUploadProgress(100);

      toast({
        title: "Bulk Upload Complete",
        description: `${result.created} products created, ${result.updated} products updated`,
      });

      // Reset form
      setFile(null);
      setParsedData([]);
      setValidationSummary(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing bulk upload:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process bulk upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Product Name,Generic Name,Composition,Category,Current Stock,Min Stock,Max Stock,Unit Price,Total Value,Status
Paracetamol 500mg,Paracetamol,Paracetamol 500mg,TABLET,100,10,500,5.50,550.00,NORMAL
Amoxicillin 250mg,Amoxicillin,Amoxicillin 250mg,CAPSULE,50,20,300,12.75,637.50,NORMAL
Cough Syrup,Dextromethorphan,Dextromethorphan HBr 15mg/5ml,SYRUP,25,5,100,45.00,1125.00,NORMAL`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NORMAL':
        return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>;
      case 'LOW_STOCK':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case 'OUT_OF_STOCK':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Upload className="mr-3 h-8 w-8 text-blue-600" />
              Bulk Product Upload
            </h1>
            <p className="text-gray-600 mt-2">
              Upload multiple products at once using CSV format for efficient inventory management
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-blue-600" />
              CSV Format Requirements
            </CardTitle>
            <CardDescription>
              Follow these guidelines for successful bulk upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Required Columns:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Product Name</strong> - Unique product identifier</li>
                  <li>• <strong>Generic Name</strong> - Generic/scientific name</li>
                  <li>• <strong>Composition</strong> - Active ingredients</li>
                  <li>• <strong>Category</strong> - TABLET, CAPSULE, SYRUP, etc.</li>
                  <li>• <strong>Current Stock</strong> - Current inventory count</li>
                  <li>• <strong>Min Stock</strong> - Minimum stock level</li>
                  <li>• <strong>Max Stock</strong> - Maximum stock level</li>
                  <li>• <strong>Unit Price</strong> - Price per unit</li>
                  <li>• <strong>Total Value</strong> - Current Stock × Unit Price</li>
                  <li>• <strong>Status</strong> - NORMAL, LOW_STOCK, OUT_OF_STOCK</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Important Notes:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Status is auto-calculated based on stock levels</li>
                  <li>• Existing products will be updated</li>
                  <li>• New products will be created</li>
                  <li>• All numeric fields must be positive numbers</li>
                  <li>• Category must match predefined values</li>
                  <li>• CSV file should not exceed 10MB</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select or drag and drop your CSV file to begin the upload process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex justify-center space-x-3">
                    <Button
                      onClick={parseAndValidateCSV}
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Validating...
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Validate & Preview
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your CSV file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports CSV files up to 10MB
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Processing Progress */}
      {(isProcessing || isUploading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {isProcessing ? 'Validating CSV...' : 'Processing Upload...'}
                  </span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Validation Summary */}
      {validationSummary && showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Validation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{validationSummary.totalRows}</div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{validationSummary.validRows}</div>
                  <div className="text-sm text-gray-600">Valid Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{validationSummary.invalidRows}</div>
                  <div className="text-sm text-gray-600">Invalid Rows</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{validationSummary.newProducts}</div>
                  <div className="text-sm text-gray-600">New Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{validationSummary.existingProducts}</div>
                  <div className="text-sm text-gray-600">Updates</div>
                </div>
              </div>

              {validationSummary.validRows > 0 && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleBulkUpload}
                    disabled={isUploading}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Process {validationSummary.validRows} Valid Products
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Data Preview */}
      {showPreview && parsedData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-blue-600" />
                Data Preview
              </CardTitle>
              <CardDescription>
                Review the parsed data before processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Composition</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((row, index) => (
                      <TableRow key={index} className={!row.isValid ? 'bg-red-50' : row.isExisting ? 'bg-orange-50' : 'bg-green-50'}>
                        <TableCell>{row.rowIndex}</TableCell>
                        <TableCell className="font-medium">{row.productName}</TableCell>
                        <TableCell className="max-w-xs truncate">{row.composition}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.currentStock}</TableCell>
                        <TableCell>₹{row.unitPrice}</TableCell>
                        <TableCell>{getStatusBadge(row.status)}</TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                              {row.isExisting ? 'Update' : 'Create'}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                              <span className="text-xs text-red-600">
                                {row.errors.join(', ')}
                              </span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 10 && (
                  <div className="text-center mt-4 text-sm text-gray-600">
                    Showing first 10 rows of {parsedData.length} total rows
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            {uploadResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{uploadResult.message}</p>
                {uploadResult.success && (
                  <p className="text-sm">
                    {uploadResult.created} products created, {uploadResult.updated} products updated
                  </p>
                )}
                {uploadResult.errors.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc list-inside">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}


export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

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

const VALID_CATEGORIES = [
  'TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 
  'DROPS', 'INHALER', 'POWDER', 'CREAM', 'GEL'
];

const VALID_STATUSES = ['NORMAL', 'LOW_STOCK', 'OUT_OF_STOCK'];

function calculateStatus(currentStock: number, minStock: number): 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
  if (currentStock === 0) return 'OUT_OF_STOCK';
  if (currentStock < minStock) return 'LOW_STOCK';
  return 'NORMAL';
}

function validateRow(row: any, rowIndex: number, existingProducts: Map<string, string>): ProductRow {
  const errors: string[] = [];
  
  // Required fields validation
  if (!row['Product Name']?.trim()) {
    errors.push('Product Name is required');
  }
  
  if (!row['Composition']?.trim()) {
    errors.push('Composition is required');
  }
  
  if (!row['Category']?.trim()) {
    errors.push('Category is required');
  } else if (!VALID_CATEGORIES.includes(row['Category'].trim().toUpperCase())) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  
  // Numeric validations
  const currentStock = parseFloat(row['Current Stock']);
  const minStock = parseFloat(row['Min Stock']);
  const maxStock = parseFloat(row['Max Stock']);
  const unitPrice = parseFloat(row['Unit Price']);
  const totalValue = parseFloat(row['Total Value']);
  
  if (isNaN(currentStock) || currentStock < 0) {
    errors.push('Current Stock must be a non-negative number');
  }
  
  if (isNaN(minStock) || minStock < 0) {
    errors.push('Min Stock must be a non-negative number');
  }
  
  if (isNaN(maxStock) || maxStock < 0) {
    errors.push('Max Stock must be a non-negative number');
  }
  
  if (isNaN(unitPrice) || unitPrice <= 0) {
    errors.push('Unit Price must be a positive number');
  }
  
  if (isNaN(totalValue) || totalValue < 0) {
    errors.push('Total Value must be a non-negative number');
  }
  
  // Logical validations
  if (!isNaN(minStock) && !isNaN(maxStock) && minStock > maxStock) {
    errors.push('Min Stock cannot be greater than Max Stock');
  }
  
  if (!isNaN(currentStock) && !isNaN(unitPrice) && !isNaN(totalValue)) {
    const expectedTotal = currentStock * unitPrice;
    if (Math.abs(totalValue - expectedTotal) > 0.01) {
      errors.push(`Total Value should be ${expectedTotal.toFixed(2)} (Current Stock × Unit Price)`);
    }
  }
  
  // Calculate status
  const calculatedStatus = calculateStatus(currentStock || 0, minStock || 0);
  
  // Check if product exists
  const productName = row['Product Name']?.trim();
  const isExisting = existingProducts.has(productName.toLowerCase());
  const existingId = isExisting ? existingProducts.get(productName.toLowerCase()) : undefined;
  
  return {
    rowIndex,
    productName: productName || '',
    genericName: row['Generic Name']?.trim() || '',
    composition: row['Composition']?.trim() || '',
    category: row['Category']?.trim().toUpperCase() || '',
    currentStock: currentStock || 0,
    minStock: minStock || 0,
    maxStock: maxStock || 0,
    unitPrice: unitPrice || 0,
    totalValue: totalValue || 0,
    status: calculatedStatus,
    isValid: errors.length === 0,
    errors,
    isExisting,
    existingId
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Read and parse CSV
    const csvText = await file.text();
    
    let records;
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid CSV format' },
        { status: 400 }
      );
    }
    
    if (records.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }
    
    // Get existing products for duplicate checking
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const existingProducts = await prisma.product.findMany({
        select: { id: true, name: true }
      });
      
      const existingProductsMap = new Map<string, string>(
        existingProducts.map((p: any) => [p.name.toLowerCase(), p.id])
      );
      
      // Validate each row
      const validatedData: ProductRow[] = records.map((row: any, index: number) => 
        validateRow(row, index + 2, existingProductsMap) // +2 because CSV starts from row 2 (after header)
      );
      
      // Calculate summary
      const summary = {
        totalRows: validatedData.length,
        validRows: validatedData.filter(row => row.isValid).length,
        invalidRows: validatedData.filter(row => !row.isValid).length,
        existingProducts: validatedData.filter(row => row.isValid && row.isExisting).length,
        newProducts: validatedData.filter(row => row.isValid && !row.isExisting).length
      };
      
      return NextResponse.json({
        success: true,
        data: validatedData,
        summary
      });
      
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('Error validating CSV:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

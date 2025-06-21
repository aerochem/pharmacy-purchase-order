
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductData {
  productName: string;
  genericName: string;
  composition: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  status: 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  isExisting?: boolean;
  existingId?: string;
}

function mapCategoryToEnum(category: string): any {
  const categoryMap: { [key: string]: any } = {
    'TABLET': 'TABLET',
    'CAPSULE': 'CAPSULE',
    'SYRUP': 'SYRUP',
    'INJECTION': 'INJECTION',
    'OINTMENT': 'OINTMENT',
    'DROPS': 'DROPS',
    'INHALER': 'INHALER',
    'POWDER': 'POWDER',
    'CREAM': 'CREAM',
    'GEL': 'GEL'
  };
  
  return categoryMap[category.toUpperCase()] || 'TABLET';
}

function mapStatusToEnum(status: string): any {
  const statusMap: { [key: string]: any } = {
    'NORMAL': 'NORMAL',
    'LOW_STOCK': 'LOW_STOCK',
    'OUT_OF_STOCK': 'OUT_OF_STOCK'
  };
  
  return statusMap[status] || 'NORMAL';
}

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json();
    
    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid products data' },
        { status: 400 }
      );
    }
    
    let created = 0;
    let updated = 0;
    const errors: string[] = [];
    
    // Process products in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          const productData: any = {
            name: product.productName,
            genericName: product.genericName || null,
            composition: product.composition,
            category: mapCategoryToEnum(product.category),
            currentStock: Math.floor(product.currentStock),
            minStockLevel: Math.floor(product.minStock),
            maxStockLevel: Math.floor(product.maxStock),
            unitPrice: parseFloat(product.unitPrice.toFixed(2)),
            status: mapStatusToEnum(product.status),
            isActive: true
          };
          
          if (product.isExisting && product.existingId) {
            // Update existing product
            await prisma.product.update({
              where: { id: product.existingId },
              data: productData
            });
            updated++;
          } else {
            // Create new product
            await prisma.product.create({
              data: productData
            });
            created++;
          }
        } catch (productError) {
          console.error(`Error processing product ${product.productName}:`, productError);
          errors.push(`Failed to process ${product.productName}: ${productError}`);
        }
      }
    }
    
    // Create inventory movements for new stock
    try {
      const newProducts = products.filter((p: ProductData) => !p.isExisting && p.currentStock > 0);
      
      for (const product of newProducts) {
        const createdProduct = await prisma.product.findFirst({
          where: { name: product.productName }
        });
        
        if (createdProduct && product.currentStock > 0) {
          await prisma.inventoryMovement.create({
            data: {
              productId: createdProduct.id,
              type: 'PURCHASE',
              quantity: product.currentStock,
              reference: 'BULK_UPLOAD',
              notes: 'Initial stock from bulk upload',
              createdBy: 'SYSTEM'
            }
          });
        }
      }
    } catch (movementError) {
      console.error('Error creating inventory movements:', movementError);
      // Don't fail the entire operation for movement errors
    }
    
    return NextResponse.json({
      success: true,
      message: `Bulk upload completed successfully`,
      created,
      updated,
      errors
    });
    
  } catch (error) {
    console.error('Error processing bulk upload:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to process bulk upload',
        created: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

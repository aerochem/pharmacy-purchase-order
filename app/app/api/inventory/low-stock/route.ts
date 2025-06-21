
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            currentStock: {
              lte: prisma.product.fields.minStockLevel
            }
          },
          {
            currentStock: {
              equals: 0
            }
          }
        ]
      },
      orderBy: [
        { currentStock: 'asc' },
        { name: 'asc' }
      ]
    });

    const alerts = lowStockProducts.map(product => {
      const stockPercentage = product.minStockLevel > 0 
        ? (product.currentStock / product.minStockLevel) * 100 
        : 0;
      
      // Estimate days until stock out (assuming average daily consumption)
      const daysUntilStockOut = product.currentStock > 0 && product.minStockLevel > 0
        ? Math.floor(product.currentStock / (product.minStockLevel * 0.1)) // Rough estimate
        : 0;

      return {
        product,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        stockPercentage: Math.round(stockPercentage),
        daysUntilStockOut: daysUntilStockOut > 0 ? daysUntilStockOut : undefined
      };
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock alerts' },
      { status: 500 }
    );
  }
}

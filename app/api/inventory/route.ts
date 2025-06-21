
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const stockStatus = searchParams.get('stockStatus');
    const search = searchParams.get('search');

    let whereClause: any = {
      isActive: true
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { composition: { contains: search, mode: 'insensitive' } }
      ];
    }

    let products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    // Filter by stock status
    if (stockStatus && stockStatus !== 'all') {
      products = products.filter(product => {
        switch (stockStatus) {
          case 'low':
            return product.currentStock <= product.minStockLevel;
          case 'out':
            return product.currentStock === 0;
          case 'normal':
            return product.currentStock > product.minStockLevel;
          default:
            return true;
        }
      });
    }

    // Add stock status to each product
    const productsWithStatus = products.map(product => ({
      ...product,
      stockStatus: product.currentStock === 0 ? 'out' : 
                   product.currentStock <= product.minStockLevel ? 'low' : 'normal',
      stockPercentage: product.minStockLevel > 0 
        ? Math.round((product.currentStock / product.minStockLevel) * 100)
        : 100
    }));

    return NextResponse.json(productsWithStatus);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

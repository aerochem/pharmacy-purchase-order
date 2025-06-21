
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        genericName: body.genericName,
        composition: body.composition,
        category: body.category,
        manufacturer: body.manufacturer,
        batchNumber: body.batchNumber,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        unitPrice: parseFloat(body.unitPrice),
        gstRate: body.gstRate,
        hsnCode: body.hsnCode,
        currentStock: parseInt(body.currentStock) || 0,
        minStockLevel: parseInt(body.minStockLevel) || 10,
        maxStockLevel: parseInt(body.maxStockLevel) || 1000,
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

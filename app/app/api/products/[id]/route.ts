
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.update({
      where: { id: params.id },
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
        isActive: body.isActive
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

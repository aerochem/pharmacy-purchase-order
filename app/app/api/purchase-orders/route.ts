
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber: body.orderNumber,
        supplierId: body.supplierId,
        status: body.status,
        orderDate: new Date(body.orderDate),
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        paymentTerms: body.paymentTerms,
        comments: body.comments,
        subtotal: body.subtotal,
        totalGst: body.totalGst,
        totalAmount: body.totalAmount,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            gstRate: item.gstRate,
            gstAmount: item.gstAmount,
            totalAmount: item.totalAmount,
            notes: item.notes,
          }))
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}

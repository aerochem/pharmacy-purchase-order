
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get dashboard statistics
    const [
      totalOrders,
      draftOrders,
      submittedOrders,
      completedOrders,
      activeSuppliers,
      activeProducts,
      recentOrders
    ] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }),
      prisma.purchaseOrder.count({ where: { status: 'SUBMITTED' } }),
      prisma.purchaseOrder.count({ where: { status: 'COMPLETED' } }),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.purchaseOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true
        }
      })
    ]);

    // Calculate total value
    const orders = await prisma.purchaseOrder.findMany({
      select: { totalAmount: true }
    });
    const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const stats = {
      totalOrders,
      draftOrders,
      submittedOrders,
      completedOrders,
      totalValue,
      activeSuppliers,
      activeProducts,
    };

    return NextResponse.json({ stats, recentOrders });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

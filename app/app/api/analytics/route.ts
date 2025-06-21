
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get current date for calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Basic stats
    const [totalOrders, totalValue] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.aggregate({
        _sum: { totalAmount: true }
      })
    ]);

    // Low stock products
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        currentStock: {
          lte: prisma.product.fields.minStockLevel
        }
      }
    });

    // Expiring products (within 30 days)
    const expiringProducts = await prisma.product.count({
      where: {
        isActive: true,
        expiryDate: {
          lte: thirtyDaysAgo,
          gte: now
        }
      }
    });

    // Monthly order trend (last 12 months)
    const monthlyOrders = await prisma.purchaseOrder.groupBy({
      by: ['orderDate'],
      where: {
        orderDate: {
          gte: oneYearAgo
        }
      },
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    // Process monthly data
    const monthlyOrderTrend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthData = monthlyOrders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        orders: monthData.reduce((sum, item) => sum + item._count.id, 0),
        value: monthData.reduce((sum, item) => sum + (item._sum.totalAmount || 0), 0)
      };
    }).reverse();

    // Category distribution
    const categoryData = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { id: true },
      _sum: { unitPrice: true }
    });

    const categoryDistribution = categoryData.map(item => ({
      category: item.category,
      count: item._count.id,
      value: item._sum.unitPrice || 0
    }));

    // Supplier performance
    const supplierData = await prisma.purchaseOrder.groupBy({
      by: ['supplierId'],
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    const suppliers = await prisma.supplier.findMany({
      where: {
        id: {
          in: supplierData.map(s => s.supplierId)
        }
      }
    });

    const supplierPerformance = supplierData.map(item => {
      const supplier = suppliers.find(s => s.id === item.supplierId);
      return {
        supplier: supplier?.name || 'Unknown',
        orders: item._count.id,
        value: item._sum.totalAmount || 0
      };
    });

    // GST breakdown
    const gstData = await prisma.purchaseOrderItem.groupBy({
      by: ['gstRate'],
      _sum: { gstAmount: true }
    });

    const gstBreakdown = gstData.map(item => ({
      rate: item.gstRate,
      amount: item._sum.gstAmount || 0
    }));

    const analytics = {
      totalOrders,
      totalValue: totalValue._sum.totalAmount || 0,
      lowStockProducts,
      expiringProducts,
      monthlyOrderTrend,
      categoryDistribution,
      supplierPerformance,
      gstBreakdown
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

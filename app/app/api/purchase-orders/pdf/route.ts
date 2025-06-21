
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { GST_RATES, GSTRate, COMPANY_INFO } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const purchaseOrder = await request.json();
    
    // Generate HTML for PDF
    const html = generatePDFHTML(purchaseOrder);
    
    // For now, return HTML that can be converted to PDF on the client side
    // This is a temporary solution until we can get Puppeteer working properly
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="PO_${purchaseOrder.orderNumber}.html"`
      }
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(purchaseOrder: any): string {
  // Calculate GST breakdown
  const gstBreakdown = purchaseOrder.items?.reduce((acc: any, item: any) => {
    const rate = GST_RATES[item.gstRate as GSTRate];
    if (!acc[rate]) acc[rate] = 0;
    acc[rate] += item.gstAmount || 0;
    return acc;
  }, {}) || {};

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Purchase Order - ${purchaseOrder.orderNumber}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body { 
          font-family: 'Arial', sans-serif; 
          margin: 0;
          padding: 0;
          line-height: 1.4;
          color: #333;
          font-size: 12px;
        }
        
        .header { 
          text-align: center; 
          margin-bottom: 25px; 
          border-bottom: 3px solid #007bff;
          padding-bottom: 15px;
        }
        
        .header h1 {
          color: #007bff;
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }
        
        .header h2 {
          color: #666;
          margin: 5px 0 0 0;
          font-size: 16px;
          font-weight: normal;
        }
        
        .company-info { 
          margin-bottom: 20px; 
          background: #f8f9fa;
          padding: 12px;
          border-radius: 4px;
          text-align: center;
        }
        
        .company-info h3 {
          margin: 0 0 5px 0;
          color: #007bff;
          font-size: 14px;
        }
        
        .company-info p {
          margin: 0;
          font-size: 11px;
          color: #666;
        }
        
        .info-grid { 
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px; 
        }
        
        .order-info, .supplier-info, .shipping-info { 
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fafafa;
        }
        
        .supplier-info h3, .order-info h3, .shipping-info h3 {
          margin: 0 0 10px 0;
          color: #007bff;
          font-size: 13px;
        }
        
        .info-row {
          margin-bottom: 6px;
          font-size: 11px;
        }
        
        .info-row strong {
          color: #333;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
          font-size: 10px;
        }
        
        th, td { 
          border: 1px solid #ddd; 
          padding: 6px 4px; 
          text-align: left; 
          vertical-align: top;
        }
        
        th { 
          background-color: #007bff; 
          color: white;
          font-weight: bold;
          font-size: 9px;
        }
        
        tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .product-name {
          font-weight: bold;
          font-size: 10px;
        }
        
        .product-details {
          font-size: 9px;
          color: #666;
          margin-top: 2px;
        }
        
        .composition {
          font-style: italic;
          color: #666;
          font-size: 9px;
        }
        
        .amount {
          text-align: right;
          font-weight: bold;
        }
        
        .totals-section { 
          margin-top: 20px;
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 20px;
        }
        
        .gst-breakdown {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f9fa;
        }
        
        .gst-breakdown h4 {
          margin: 0 0 10px 0;
          color: #007bff;
          font-size: 12px;
        }
        
        .gst-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 10px;
        }
        
        .gst-total {
          border-top: 1px solid #ddd;
          margin-top: 8px;
          padding-top: 8px;
          font-weight: bold;
        }
        
        .total-summary {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .total-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 11px;
        }
        
        .final-total { 
          font-weight: bold; 
          font-size: 13px;
          color: #007bff;
          border-top: 2px solid #007bff;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .comments {
          margin-top: 20px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f9fa;
        }
        
        .comments h3 {
          margin: 0 0 8px 0;
          color: #007bff;
          font-size: 12px;
        }
        
        .comments p {
          margin: 0;
          font-size: 10px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
          font-size: 10px;
        }
        
        .currency {
          font-family: 'Courier New', monospace;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PURCHASE ORDER</h1>
        <h2>${purchaseOrder.orderNumber || 'N/A'}</h2>
      </div>
      
      <div class="company-info">
        <h3>${COMPANY_INFO.name}</h3>
        <p>${COMPANY_INFO.address}</p>
        <p>Email: ${COMPANY_INFO.email} | Phone: ${COMPANY_INFO.phone} | GST: ${COMPANY_INFO.gst}</p>
      </div>
      
      <div class="info-grid">
        <div class="order-info">
          <h3>Order Information</h3>
          <div class="info-row">
            <strong>Order Date:</strong> ${formatDate(new Date(purchaseOrder.orderDate))}
          </div>
          ${purchaseOrder.expectedDate ? `
            <div class="info-row">
              <strong>Expected Delivery:</strong> ${formatDate(new Date(purchaseOrder.expectedDate))}
            </div>
          ` : ''}
          <div class="info-row">
            <strong>Status:</strong> <span style="color: #007bff; font-weight: bold;">${purchaseOrder.status}</span>
          </div>
          <div class="info-row">
            <strong>Payment Terms:</strong> ${purchaseOrder.paymentTerms || 'As per agreement'}
          </div>
          <div class="info-row">
            <strong>Total Items:</strong> ${purchaseOrder.items?.length || 0}
          </div>
          <div class="info-row">
            <strong>Order Value:</strong> <span style="color: #28a745; font-weight: bold;" class="currency">${formatCurrency(purchaseOrder.totalAmount)}</span>
          </div>
        </div>
        
        <div class="supplier-info">
          <h3>Supplier Information</h3>
          <div class="info-row">
            <strong>Name:</strong> ${purchaseOrder.supplier?.name || 'N/A'}
          </div>
          ${purchaseOrder.supplier?.contactPerson ? `
            <div class="info-row">
              <strong>Contact Person:</strong> ${purchaseOrder.supplier.contactPerson}
            </div>
          ` : ''}
          ${purchaseOrder.supplier?.email ? `
            <div class="info-row">
              <strong>Email:</strong> ${purchaseOrder.supplier.email}
            </div>
          ` : ''}
          ${purchaseOrder.supplier?.phone ? `
            <div class="info-row">
              <strong>Phone:</strong> ${purchaseOrder.supplier.phone}
            </div>
          ` : ''}
          ${purchaseOrder.supplier?.gstNumber ? `
            <div class="info-row">
              <strong>GST Number:</strong> ${purchaseOrder.supplier.gstNumber}
            </div>
          ` : ''}
          ${purchaseOrder.supplier?.address ? `
            <div class="info-row">
              <strong>Address:</strong> ${purchaseOrder.supplier.address}
            </div>
          ` : ''}
        </div>
        
        <div class="shipping-info">
          <h3>Shipping Address</h3>
          <div class="info-row">
            <strong>${COMPANY_INFO.shippingAddress}</strong>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Product Details</th>
            <th style="width: 24%;">Composition</th>
            <th style="width: 10%;">Category</th>
            <th style="width: 6%;">Qty</th>
            <th style="width: 12%;">Unit Price (₹)</th>
            <th style="width: 8%;">GST%</th>
            <th style="width: 10%;">GST Amt (₹)</th>
            <th style="width: 12%;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${(purchaseOrder.items || []).map((item: any, index: number) => `
            <tr>
              <td>
                <div class="product-name">${item.product?.name || 'N/A'}</div>
                ${item.product?.genericName ? `<div class="product-details">Generic: ${item.product.genericName}</div>` : ''}
                ${item.product?.manufacturer ? `<div class="product-details">Mfg: ${item.product.manufacturer}</div>` : ''}
                ${item.notes ? `<div class="product-details">Note: ${item.notes}</div>` : ''}
              </td>
              <td class="composition">${item.product?.composition || 'N/A'}</td>
              <td>${item.product?.category || 'N/A'}</td>
              <td style="text-align: center;">${item.quantity || 0}</td>
              <td class="amount currency">${formatCurrency(item.unitPrice || 0)}</td>
              <td style="text-align: center;">${GST_RATES[item.gstRate as GSTRate] || 0}%</td>
              <td class="amount currency">${formatCurrency(item.gstAmount || 0)}</td>
              <td class="amount currency">${formatCurrency(item.totalAmount || 0)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals-section">
        <div class="gst-breakdown">
          <h4>GST Breakdown (Indian Rupees)</h4>
          ${Object.entries(gstBreakdown).length > 0 ? Object.entries(gstBreakdown).map(([rate, amount]) => `
            <div class="gst-item">
              <span>GST @ ${rate}%:</span>
              <span class="currency"><strong>${formatCurrency(Number(amount))}</strong></span>
            </div>
          `).join('') : '<div class="gst-item"><span>No GST applicable</span></div>'}
          <div class="gst-total gst-item">
            <span><strong>Total GST:</strong></span>
            <span class="currency"><strong>${formatCurrency(purchaseOrder.totalGst || 0)}</strong></span>
          </div>
        </div>
        
        <div class="total-summary">
          <div class="total-item">
            <span>Subtotal (Before GST):</span>
            <span class="currency"><strong>${formatCurrency(purchaseOrder.subtotal || 0)}</strong></span>
          </div>
          <div class="total-item">
            <span>Total GST:</span>
            <span class="currency"><strong>${formatCurrency(purchaseOrder.totalGst || 0)}</strong></span>
          </div>
          <div class="final-total total-item">
            <span>Total Amount (₹):</span>
            <span class="currency">${formatCurrency(purchaseOrder.totalAmount || 0)}</span>
          </div>
        </div>
      </div>
      
      ${purchaseOrder.comments ? `
        <div class="comments">
          <h3>Comments & Special Instructions</h3>
          <p>${purchaseOrder.comments}</p>
        </div>
      ` : ''}
      
      <div class="footer">
        <p><strong>Generated on:</strong> ${formatDate(new Date())}</p>
        <p>This is a computer-generated purchase order for pharmaceutical products.</p>
        <p>Please verify all details including composition and GST rates before processing.</p>
      </div>
    </body>
    </html>
  `;
}

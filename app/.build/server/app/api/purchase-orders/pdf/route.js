"use strict";(()=>{var t={};t.id=134,t.ids=[134],t.modules={399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9741:(t,e,o)=>{o.r(e),o.d(e,{originalPathname:()=>x,patchFetch:()=>v,requestAsyncStorage:()=>u,routeModule:()=>m,serverHooks:()=>h,staticGenerationAsyncStorage:()=>f});var r={};o.r(r),o.d(r,{POST:()=>g,dynamic:()=>c});var n=o(9303),s=o(8716),i=o(3131),a=o(7070),d=o(5621);function p(t){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2}).format(t)}function l(t){return new Intl.DateTimeFormat("en-IN",{year:"numeric",month:"2-digit",day:"2-digit"}).format(t)}let c="force-dynamic";async function g(t){try{let e=await t.json(),o=function(t){let e=t.items?.reduce((t,e)=>{let o=d.UN[e.gstRate];return t[o]||(t[o]=0),t[o]+=e.gstAmount||0,t},{})||{};return`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Purchase Order - ${t.orderNumber}</title>
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
        <h2>${t.orderNumber||"N/A"}</h2>
      </div>
      
      <div class="company-info">
        <h3>${d.hg.name}</h3>
        <p>${d.hg.address}</p>
        <p>Email: ${d.hg.email} | Phone: ${d.hg.phone} | GST: ${d.hg.gst}</p>
      </div>
      
      <div class="info-grid">
        <div class="order-info">
          <h3>Order Information</h3>
          <div class="info-row">
            <strong>Order Date:</strong> ${l(new Date(t.orderDate))}
          </div>
          ${t.expectedDate?`
            <div class="info-row">
              <strong>Expected Delivery:</strong> ${l(new Date(t.expectedDate))}
            </div>
          `:""}
          <div class="info-row">
            <strong>Status:</strong> <span style="color: #007bff; font-weight: bold;">${t.status}</span>
          </div>
          <div class="info-row">
            <strong>Payment Terms:</strong> ${t.paymentTerms||"As per agreement"}
          </div>
          <div class="info-row">
            <strong>Total Items:</strong> ${t.items?.length||0}
          </div>
          <div class="info-row">
            <strong>Order Value:</strong> <span style="color: #28a745; font-weight: bold;" class="currency">${p(t.totalAmount)}</span>
          </div>
        </div>
        
        <div class="supplier-info">
          <h3>Supplier Information</h3>
          <div class="info-row">
            <strong>Name:</strong> ${t.supplier?.name||"N/A"}
          </div>
          ${t.supplier?.contactPerson?`
            <div class="info-row">
              <strong>Contact Person:</strong> ${t.supplier.contactPerson}
            </div>
          `:""}
          ${t.supplier?.email?`
            <div class="info-row">
              <strong>Email:</strong> ${t.supplier.email}
            </div>
          `:""}
          ${t.supplier?.phone?`
            <div class="info-row">
              <strong>Phone:</strong> ${t.supplier.phone}
            </div>
          `:""}
          ${t.supplier?.gstNumber?`
            <div class="info-row">
              <strong>GST Number:</strong> ${t.supplier.gstNumber}
            </div>
          `:""}
          ${t.supplier?.address?`
            <div class="info-row">
              <strong>Address:</strong> ${t.supplier.address}
            </div>
          `:""}
        </div>
        
        <div class="shipping-info">
          <h3>Shipping Address</h3>
          <div class="info-row">
            <strong>${d.hg.shippingAddress}</strong>
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
          ${(t.items||[]).map((t,e)=>`
            <tr>
              <td>
                <div class="product-name">${t.product?.name||"N/A"}</div>
                ${t.product?.genericName?`<div class="product-details">Generic: ${t.product.genericName}</div>`:""}
                ${t.product?.manufacturer?`<div class="product-details">Mfg: ${t.product.manufacturer}</div>`:""}
                ${t.notes?`<div class="product-details">Note: ${t.notes}</div>`:""}
              </td>
              <td class="composition">${t.product?.composition||"N/A"}</td>
              <td>${t.product?.category||"N/A"}</td>
              <td style="text-align: center;">${t.quantity||0}</td>
              <td class="amount currency">${p(t.unitPrice||0)}</td>
              <td style="text-align: center;">${d.UN[t.gstRate]||0}%</td>
              <td class="amount currency">${p(t.gstAmount||0)}</td>
              <td class="amount currency">${p(t.totalAmount||0)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      <div class="totals-section">
        <div class="gst-breakdown">
          <h4>GST Breakdown (Indian Rupees)</h4>
          ${Object.entries(e).length>0?Object.entries(e).map(([t,e])=>`
            <div class="gst-item">
              <span>GST @ ${t}%:</span>
              <span class="currency"><strong>${p(Number(e))}</strong></span>
            </div>
          `).join(""):'<div class="gst-item"><span>No GST applicable</span></div>'}
          <div class="gst-total gst-item">
            <span><strong>Total GST:</strong></span>
            <span class="currency"><strong>${p(t.totalGst||0)}</strong></span>
          </div>
        </div>
        
        <div class="total-summary">
          <div class="total-item">
            <span>Subtotal (Before GST):</span>
            <span class="currency"><strong>${p(t.subtotal||0)}</strong></span>
          </div>
          <div class="total-item">
            <span>Total GST:</span>
            <span class="currency"><strong>${p(t.totalGst||0)}</strong></span>
          </div>
          <div class="final-total total-item">
            <span>Total Amount (₹):</span>
            <span class="currency">${p(t.totalAmount||0)}</span>
          </div>
        </div>
      </div>
      
      ${t.comments?`
        <div class="comments">
          <h3>Comments & Special Instructions</h3>
          <p>${t.comments}</p>
        </div>
      `:""}
      
      <div class="footer">
        <p><strong>Generated on:</strong> ${l(new Date)}</p>
        <p>This is a computer-generated purchase order for pharmaceutical products.</p>
        <p>Please verify all details including composition and GST rates before processing.</p>
      </div>
    </body>
    </html>
  `}(e);return new a.NextResponse(o,{headers:{"Content-Type":"text/html","Content-Disposition":`inline; filename="PO_${e.orderNumber}.html"`}})}catch(t){return console.error("Error generating PDF:",t),a.NextResponse.json({error:"Failed to generate PDF"},{status:500})}}let m=new n.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/purchase-orders/pdf/route",pathname:"/api/purchase-orders/pdf",filename:"route",bundlePath:"app/api/purchase-orders/pdf/route"},resolvedPagePath:"/home/ubuntu/pharmacy_purchase_order/app/app/api/purchase-orders/pdf/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:u,staticGenerationAsyncStorage:f,serverHooks:h}=m,x="/api/purchase-orders/pdf/route";function v(){return(0,i.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:f})}},5621:(t,e,o)=>{var r,n,s,i;o.d(e,{UN:()=>a,WZ:()=>n,hg:()=>d,tj:()=>r}),function(t){t.TABLET="TABLET",t.CAPSULE="CAPSULE",t.SYRUP="SYRUP",t.INJECTION="INJECTION",t.OINTMENT="OINTMENT",t.DROPS="DROPS",t.INHALER="INHALER",t.POWDER="POWDER",t.CREAM="CREAM",t.GEL="GEL"}(r||(r={})),function(t){t.GST_5="GST_5",t.GST_12="GST_12",t.GST_18="GST_18"}(n||(n={})),function(t){t.DRAFT="DRAFT",t.SUBMITTED="SUBMITTED",t.APPROVED="APPROVED",t.REJECTED="REJECTED",t.COMPLETED="COMPLETED",t.CANCELLED="CANCELLED"}(s||(s={})),function(t){t.NORMAL="NORMAL",t.LOW_STOCK="LOW_STOCK",t.OUT_OF_STOCK="OUT_OF_STOCK"}(i||(i={}));let a={GST_5:5,GST_12:12,GST_18:18},d={name:"AERO-CHEM Neutron",address:"803/B, Synergy Tower, Nr. Vodafone House, Corporate Road, Prahlad Nagar, Ahmedabad-380054, Gujarat",email:"purchase@aerochem.in",phone:"079-40067800",gst:"24AAMPC2680E1Z1",shippingAddress:"SHED NO. D-99, BLOCK NO. 351 PAIKI 1, TULSI ESTATE AND PLAZA, CHANGODAR - 382220, TALUKA: SANAND, DISTRICT: AHMEDABAD-RURAL"}}};var e=require("../../../../webpack-runtime.js");e.C(t);var o=t=>e(e.s=t),r=e.X(0,[276,972],()=>o(9741));module.exports=r})();
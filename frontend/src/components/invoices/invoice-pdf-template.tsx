'use client';

import { forwardRef } from 'react';
import { formatCurrency, formatSimpleDate } from '@/lib/format';
import type { Invoice, Client } from '@/types/api';

interface InvoicePDFTemplateProps {
  invoice: Invoice;
  client?: Client;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
}

export const InvoicePDFTemplate = forwardRef<HTMLDivElement, InvoicePDFTemplateProps>(
  ({ invoice, client, companyName = 'InvoIQ', companyEmail, companyPhone, companyAddress }, ref) => {
    const subtotal = invoice.subtotal || invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * (invoice.tax || 0)) / 100;
    const total = invoice.total || subtotal + taxAmount;

    return (
      <div
        ref={ref}
        data-pdf-template="true"
        style={{
          width: '210mm',
          minHeight: '297mm',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#000',
          backgroundColor: '#ffffff',
          padding: '48px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
          {/* Company Info */}
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>{companyName}</h1>
            {(companyEmail || companyPhone || companyAddress) && (
              <div style={{ fontSize: '14px', color: '#4b5563' }}>
                {companyEmail && <p style={{ margin: '4px 0' }}>{companyEmail}</p>}
                {companyPhone && <p style={{ margin: '4px 0' }}>{companyPhone}</p>}
                {companyAddress && <p style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }}>{companyAddress}</p>}
              </div>
            )}
          </div>

          {/* Invoice Title & Number */}
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>INVOICE</h2>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151' }}>#{invoice.number}</p>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#4b5563' }}>
              <p>
                <span style={{ fontWeight: '600' }}>Status: </span>
                <span
                  style={{
                    fontWeight: 'bold',
                    color: invoice.status === 'paid'
                      ? '#16a34a'
                      : invoice.status === 'overdue'
                      ? '#dc2626'
                      : invoice.status === 'sent'
                      ? '#2563eb'
                      : '#4b5563'
                  }}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Client & Date Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
          {/* Bill To */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px' }}>Bill To</h3>
            <div style={{ fontSize: '14px' }}>
              <p style={{ fontWeight: 'bold', color: '#111827', fontSize: '18px', marginBottom: '8px' }}>{client?.name || 'Unknown Client'}</p>
              {client?.email && <p style={{ color: '#4b5563', margin: '4px 0' }}>{client.email}</p>}
              {client?.phone && <p style={{ color: '#4b5563', margin: '4px 0' }}>{client.phone}</p>}
              {client?.address && (
                <p style={{ color: '#4b5563', whiteSpace: 'pre-wrap', marginTop: '4px' }}>{client.address}</p>
              )}
            </div>
          </div>

          {/* Invoice Dates */}
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px' }}>Invoice Details</h3>
            <div style={{ fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#4b5563' }}>Issue Date:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {formatSimpleDate(invoice.issued_date)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4b5563' }}>Due Date:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {formatSimpleDate(invoice.due_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '48px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase' }}>
                  Description
                </th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', width: '80px' }}>
                  Qty
                </th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', width: '112px' }}>
                  Unit Price
                </th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', width: '128px' }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 8px', fontSize: '14px', color: '#111827' }}>{item.description}</td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                    {Number(item.quantity)}
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: '14px', fontWeight: '600', color: '#111827', textAlign: 'right' }}>
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
          <div style={{ width: '320px' }}>
            <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#4b5563' }}>Subtotal:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
            {invoice.tax > 0 && (
              <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563' }}>Tax ({invoice.tax}%):</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Total:</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ marginBottom: '48px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px' }}>Notes</h3>
            <p style={{ fontSize: '14px', color: '#374151', whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '24px', marginTop: 'auto' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            Thank you for your business! • Generated by {companyName}
          </p>
        </div>
      </div>
    );
  }
);

InvoicePDFTemplate.displayName = 'InvoicePDFTemplate';

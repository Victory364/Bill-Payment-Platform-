import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';

export default function History({ transactions, onViewReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filtered transactions list
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.phone && tx.phone.includes(searchTerm)) ||
      (tx.meterNumber && tx.meterNumber.includes(searchTerm)) ||
      (tx.smartcardNo && tx.smartcardNo.includes(searchTerm));
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'left' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Transaction History</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Search, filter and download receipts of all your past utility activities.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 2, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by ID, Phone, Meter number or Reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '38px', fontSize: '13px' }}
          />
        </div>

        {/* Type Filter */}
        <div style={{ flex: 1, minWidth: '130px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <select 
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '100%', fontSize: '13px', padding: '10px' }}
          >
            <option value="all">All Service Types</option>
            <option value="airtime">Airtime</option>
            <option value="data">Data Bundle</option>
            <option value="electricity">Electricity</option>
            <option value="cable-tv">Cable TV</option>
            <option value="funding">Funding Inflows</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: 1, minWidth: '130px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <select 
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', fontSize: '13px', padding: '10px' }}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

      </div>

      {/* Transaction Log Table */}
      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Transaction Description</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Reference Code</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Service Type</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Payment Date</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Amount (₦)</th>
                <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr 
                    key={tx.id}
                    onClick={() => onViewReceipt(tx)}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    className="history-row-hover"
                  >
                    <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: 'none' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: tx.type === 'funding' ? 'var(--success-glow)' : 'rgba(255,255,255,0.03)',
                        color: tx.type === 'funding' ? 'var(--success)' : 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {tx.type === 'funding' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <span style={{ fontWeight: '600' }}>{tx.title}</span>
                    </td>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {tx.reference}
                    </td>
                    <td style={{ padding: '16px 24px', textTransform: 'capitalize' }}>
                      {tx.type === 'cable-tv' ? 'Cable TV' : tx.type}
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                      {tx.date}
                    </td>
                    <td style={{ 
                      padding: '16px 24px', 
                      fontWeight: '700', 
                      fontFamily: 'monospace',
                      color: tx.type === 'funding' ? 'var(--success)' : 'var(--text-main)'
                    }}>
                      {tx.type === 'funding' ? '+' : '-'}
                      <span style={{ fontFamily: 'var(--font-body)', marginRight: '2px' }}>₦</span>
                      <span style={{ fontFamily: 'monospace' }}>{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${tx.status === 'success' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-error'}`} style={{ fontSize: '9px' }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .history-row-hover:hover {
          background-color: rgba(255, 255, 255, 0.03) !important;
        }
        :root.light .history-row-hover:hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
      `}</style>

    </div>
  );
}

import { useState } from 'react';

export default function LeadsTable({ leads, skippedLeads, onEditLead, onExportCSV }) {
  const [activeTab, setActiveTab] = useState('success');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort leads
  const getFilteredLeads = () => {
    let result = [...leads];
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(lead => 
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        (lead.company && lead.company.toLowerCase().includes(q)) ||
        (lead.city && lead.city.toLowerCase().includes(q)) ||
        (lead.crm_note && lead.crm_note.toLowerCase().includes(q)) ||
        (lead.description && lead.description.toLowerCase().includes(q))
      );
    }
    
    if (statusFilter) {
      result = result.filter(lead => lead.crm_status === statusFilter);
    }
    
    if (sourceFilter) {
      result = result.filter(lead => lead.data_source === sourceFilter);
    }
    
    result.sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      
      if (sortBy === 'created_at') {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  };

  const filteredLeads = getFilteredLeads();

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '🔼' : '🔽';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'GOOD_LEAD_FOLLOW_UP':
        return <span className="badge badge-good">Follow Up</span>;
      case 'DID_NOT_CONNECT':
        return <span className="badge badge-connect">No Connect</span>;
      case 'BAD_LEAD':
        return <span className="badge badge-bad">Bad Lead</span>;
      case 'SALE_DONE':
        return <span className="badge badge-done">Sale Done</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' }}>None</span>;
    }
  };

  const triggerExport = () => {
    onExportCSV(filteredLeads);
  };

  return (
    <div className="glass-card">
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'success' ? 'active' : ''}`}
          onClick={() => setActiveTab('success')}
        >
          All Saved Leads <span className="tab-count">{leads.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'skipped' ? 'active' : ''}`}
          onClick={() => setActiveTab('skipped')}
        >
          Skipped Rows (Last Import) <span className="tab-count">{skippedLeads.length}</span>
        </button>
      </div>

      {activeTab === 'success' ? (
        <div>
          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '0.6rem 1rem' }} 
                placeholder="Search leads by name, email, company, notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ minWidth: '150px' }}>
              <select 
                className="form-input" 
                style={{ width: '100%', padding: '0.6rem' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="GOOD_LEAD_FOLLOW_UP">Follow Up</option>
                <option value="DID_NOT_CONNECT">No Connect</option>
                <option value="BAD_LEAD">Bad Lead</option>
                <option value="SALE_DONE">Sale Done</option>
              </select>
            </div>

            <div style={{ minWidth: '150px' }}>
              <select 
                className="form-input" 
                style={{ width: '100%', padding: '0.6rem' }}
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
              >
                <option value="">All Sources</option>
                <option value="leads_on_demand">Leads on Demand</option>
                <option value="meridian_tower">Meridian Tower</option>
                <option value="eden_park">Eden Park</option>
                <option value="varah_swamy">Varah Swamy</option>
                <option value="sarjapur_plots">Sarjapur Plots</option>
              </select>
            </div>

            <button className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem' }} onClick={triggerExport}>
              📤 Export CSV
            </button>
          </div>

          {/* Table */}
          {filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No lead records found in the database.
              {leads.length > 0 && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Try clearing your query or status filters.</p>}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                      Name {getSortIcon('name')}
                    </th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('company')}>
                      Company {getSortIcon('company')}
                    </th>
                    <th>Location</th>
                    <th style={{ cursor: 'pointer' }} onClick={() => handleSort('created_at')}>
                      Created {getSortIcon('created_at')}
                    </th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>CRM Notes</th>
                    <th>Possession</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} 
                          onClick={() => onEditLead(rec)}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                      <td style={{ fontWeight: 600 }} title={rec.name}>{rec.name || '—'}</td>
                      <td title={rec.email}>{rec.email || '—'}</td>
                      <td title={`${rec.country_code} ${rec.mobile_without_country_code}`}>
                        {rec.mobile_without_country_code ? `${rec.country_code} ${rec.mobile_without_country_code}`.trim() : '—'}
                      </td>
                      <td title={rec.company}>{rec.company || '—'}</td>
                      <td title={`${rec.city}, ${rec.state}, ${rec.country}`}>
                        {[rec.city, rec.state, rec.country].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td>{rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '—'}</td>
                      <td>{getStatusBadge(rec.crm_status)}</td>
                      <td title={rec.data_source}>{rec.data_source || '—'}</td>
                      <td title={rec.crm_note} style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                        {rec.crm_note || '—'}
                      </td>
                      <td title={rec.possession_time}>{rec.possession_time || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Skipped Table */}
          {skippedLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No leads were skipped during the last ingestion batch.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Skipped Reason</th>
                    <th>Original Messy CSV Record</th>
                  </tr>
                </thead>
                <tbody>
                  {skippedLeads.map((skip, i) => (
                    <tr key={i}>
                      <td style={{ verticalAlign: 'top', color: 'var(--color-warning)', fontWeight: 600 }}>
                        ⚠️ {skip.reason}
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <div className="json-view">
                          {JSON.stringify(skip.original_record, null, 2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPanel({ leads }) {
  const totalLeadsCount = leads.length;
  const followUpLeadsCount = leads.filter(l => l.crm_status === 'GOOD_LEAD_FOLLOW_UP').length;
  const saleDoneCount = leads.filter(l => l.crm_status === 'SALE_DONE').length;
  const didNotConnectCount = leads.filter(l => l.crm_status === 'DID_NOT_CONNECT').length;
  const badLeadsCount = leads.filter(l => l.crm_status === 'BAD_LEAD').length;
  
  const conversionRate = totalLeadsCount > 0 
    ? ((saleDoneCount / totalLeadsCount) * 100).toFixed(1) 
    : '0.0';

  const getStatusPercentage = (count) => {
    if (totalLeadsCount === 0) return '0%';
    return `${(count / totalLeadsCount) * 100}%`;
  };

  const getSourceCount = (src) => leads.filter(l => l.data_source === src).length;
  
  const sourcesList = [
    { key: 'leads_on_demand', label: 'Leads on Demand', color: 'var(--color-primary)' },
    { key: 'meridian_tower', label: 'Meridian Tower', color: '#3b82f6' },
    { key: 'eden_park', label: 'Eden Park', color: 'var(--color-success)' },
    { key: 'varah_swamy', label: 'Varah Swamy', color: 'var(--color-warning)' },
    { key: 'sarjapur_plots', label: 'Sarjapur Plots', color: '#ec4899' },
    { key: '', label: 'Unspecified', color: 'var(--color-text-muted)' }
  ];

  if (totalLeadsCount === 0) return null;

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div className="stats-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card total">
          <span className="stat-label">Total Leads Database</span>
          <span className="stat-val" style={{ color: '#e2e8f0' }}>{totalLeadsCount}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-label">Active Follow Ups</span>
          <span className="stat-val" style={{ color: 'var(--color-success)' }}>{followUpLeadsCount}</span>
        </div>
        <div className="stat-card total" style={{ borderLeftColor: '#3b82f6' }}>
          <span className="stat-label">Sales Closed</span>
          <span className="stat-val" style={{ color: '#60a5fa' }}>{saleDoneCount}</span>
        </div>
        <div className="stat-card skipped" style={{ borderLeftColor: '#38bdf8' }}>
          <span className="stat-label">Conversion Rate</span>
          <span className="stat-val" style={{ color: '#38bdf8' }}>{conversionRate}%</span>
        </div>
      </div>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Status Chart Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Leads By CRM Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Follow Up</span>
                <span style={{ fontWeight: 600 }}>{followUpLeadsCount} ({getStatusPercentage(followUpLeadsCount)})</span>
              </div>
              <div className="progress-track" style={{ height: '6px', margin: 0 }}>
                <div className="progress-bar" style={{ width: getStatusPercentage(followUpLeadsCount), background: 'var(--color-success)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Sale Done</span>
                <span style={{ fontWeight: 600 }}>{saleDoneCount} ({getStatusPercentage(saleDoneCount)})</span>
              </div>
              <div className="progress-track" style={{ height: '6px', margin: 0 }}>
                <div className="progress-bar" style={{ width: getStatusPercentage(saleDoneCount), background: 'var(--color-primary)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>No Connect</span>
                <span style={{ fontWeight: 600 }}>{didNotConnectCount} ({getStatusPercentage(didNotConnectCount)})</span>
              </div>
              <div className="progress-track" style={{ height: '6px', margin: 0 }}>
                <div className="progress-bar" style={{ width: getStatusPercentage(didNotConnectCount), background: 'var(--color-warning)' }}></div>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Bad Lead</span>
                <span style={{ fontWeight: 600 }}>{badLeadsCount} ({getStatusPercentage(badLeadsCount)})</span>
              </div>
              <div className="progress-track" style={{ height: '6px', margin: 0 }}>
                <div className="progress-bar" style={{ width: getStatusPercentage(badLeadsCount), background: 'var(--color-danger)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Origins Chart Card */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🌐 Leads By Data Source</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {sourcesList.map(src => {
              const count = getSourceCount(src.key);
              return (
                <div key={src.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span>{src.label}</span>
                    <span style={{ fontWeight: 600 }}>{count} ({getStatusPercentage(count)})</span>
                  </div>
                  <div className="progress-track" style={{ height: '4px', margin: 0 }}>
                    <div className="progress-bar" style={{ width: getStatusPercentage(count), background: src.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

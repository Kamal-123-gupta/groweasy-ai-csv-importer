import { useState } from 'react';

export default function LeadEditModal({ lead, onClose, onUpdate, onDelete }) {
  const [editingLead, setEditingLead] = useState({ ...lead });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editingLead);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Lead Refinement Sheet</h2>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '1.5rem', cursor: 'pointer' }}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.name || ''} 
                onChange={e => setEditingLead({ ...editingLead, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={editingLead.email || ''} 
                onChange={e => setEditingLead({ ...editingLead, email: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem' }}>
              <div>
                <label className="form-label">Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="+91"
                  value={editingLead.country_code || ''} 
                  onChange={e => setEditingLead({ ...editingLead, country_code: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Phone Mobile</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingLead.mobile_without_country_code || ''} 
                  onChange={e => setEditingLead({ ...editingLead, mobile_without_country_code: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.company || ''} 
                onChange={e => setEditingLead({ ...editingLead, company: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.city || ''} 
                onChange={e => setEditingLead({ ...editingLead, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.state || ''} 
                onChange={e => setEditingLead({ ...editingLead, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.country || ''} 
                onChange={e => setEditingLead({ ...editingLead, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lead Owner</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.lead_owner || ''} 
                onChange={e => setEditingLead({ ...editingLead, lead_owner: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CRM Status</label>
              <select 
                className="form-input"
                value={editingLead.crm_status || ''} 
                onChange={e => setEditingLead({ ...editingLead, crm_status: e.target.value })}
              >
                <option value="">None</option>
                <option value="GOOD_LEAD_FOLLOW_UP">Follow Up</option>
                <option value="DID_NOT_CONNECT">No Connect</option>
                <option value="BAD_LEAD">Bad Lead</option>
                <option value="SALE_DONE">Sale Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data Source</label>
              <select 
                className="form-input"
                value={editingLead.data_source || ''} 
                onChange={e => setEditingLead({ ...editingLead, data_source: e.target.value })}
              >
                <option value="">None</option>
                <option value="leads_on_demand">Leads on Demand</option>
                <option value="meridian_tower">Meridian Tower</option>
                <option value="eden_park">Eden Park</option>
                <option value="varah_swamy">Varah Swamy</option>
                <option value="sarjapur_plots">Sarjapur Plots</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Possession Time</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.possession_time || ''} 
                onChange={e => setEditingLead({ ...editingLead, possession_time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Created At (ISO)</label>
              <input 
                type="text" 
                className="form-input" 
                value={editingLead.created_at || ''} 
                onChange={e => setEditingLead({ ...editingLead, created_at: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">CRM Notes / Overflows</label>
            <textarea 
              className="form-input" 
              rows="2"
              value={editingLead.crm_note || ''} 
              onChange={e => setEditingLead({ ...editingLead, crm_note: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Detailed Description</label>
            <textarea 
              className="form-input" 
              rows="2"
              value={editingLead.description || ''} 
              onChange={e => setEditingLead({ ...editingLead, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ background: 'var(--color-danger-bg)', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.2)' }}
              onClick={() => onDelete(editingLead.id)}
            >
              🗑️ Delete Lead
            </button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                💾 Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

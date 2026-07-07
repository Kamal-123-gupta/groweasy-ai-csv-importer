'use client';

import { useState, useEffect } from 'react';
import CSVUploadZone from '../components/CSVUploadZone';
import AnalyticsPanel from '../components/AnalyticsPanel';
import LeadsTable from '../components/LeadsTable';
import LeadEditModal from '../components/LeadEditModal';
import { exportToCSV } from '../utils/csvExporter';

export default function Home() {
  const [leads, setLeads] = useState([]);
  const [skippedLeads, setSkippedLeads] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [groqKey, setGroqKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingLead, setEditingLead] = useState(null);

  // Load leads from database on mount
  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/leads');
      if (!response.ok) {
        throw new Error('Failed to load leads from the server.');
      }
      const data = await response.json();
      setLeads(data);
      if (data.length === 0) {
        setShowUpload(true);
      }
    } catch (err) {
      console.error("Error loading leads:", err);
      setErrorMessage(err.message || 'Could not connect to the backend server.');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Update lead details in DB
  const handleUpdateLead = async (updatedLead) => {
    try {
      setErrorMessage('');
      const res = await fetch(`http://localhost:5000/api/leads/${updatedLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead)
      });
      if (res.ok) {
        await fetchLeads();
        setEditingLead(null);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update lead.');
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Delete lead from DB
  const handleDeleteLead = async (id) => {
    try {
      setErrorMessage('');
      const res = await fetch(`http://localhost:5000/api/leads/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchLeads();
        setEditingLead(null);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete lead.');
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // CSV import completed callback
  const handleImportFinished = async (importedRecords, skippedRecords, totalCount) => {
    setSkippedLeads(skippedRecords);
    setShowUpload(false);
    await fetchLeads();
  };

  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <header className="app-header">
        <div className="app-logo">
          <div className="logo-icon">GE</div>
          <span>GrowEasy<span className="logo-accent">AI</span></span>
        </div>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '50px' }}>
            Persistent CRM Dashboard
          </span>
        </div>
      </header>

      <main className="main-layout">
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="dashboard-title">Lead Extraction Dashboard</h1>
            <p className="dashboard-subtitle" style={{ marginBottom: 0 }}>
              AI-cleansed CRM directory backed by local database storage. Ingest, map, edit, and filter leads dynamically.
            </p>
          </div>
          {!showUpload && (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              📥 Ingest CSV File
            </button>
          )}
        </div>

        {/* Global Settings & API Configuration widget */}
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
          <div className="config-section" style={{ margin: 0 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="apiKey">Groq API Key (Optional)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  id="apiKey"
                  type="password"
                  className="form-input"
                  style={{ flex: 1, padding: '0.6rem 1rem' }}
                  placeholder="Paste GROQ_API_KEY here to override server config (starts with gsk_)..."
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  If left empty, the server will default to the `.env` variable configuration.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic error display */}
        {errorMessage && (
          <div className="alert-message alert-error">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ flex: 1 }}>{errorMessage}</span>
            <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setErrorMessage('')}>×</button>
          </div>
        )}

        {/* IMPORT PIPELINE WINDOW */}
        {showUpload && (
          <CSVUploadZone 
            leadsCount={leads.length}
            onBack={() => setShowUpload(false)}
            onImportFinished={handleImportFinished}
            groqKey={groqKey}
          />
        )}

        {/* PERSISTENT CORE DATABASE VIEW */}
        {!showUpload && (
          <div>
            <AnalyticsPanel leads={leads} />
            
            <LeadsTable 
              leads={leads}
              skippedLeads={skippedLeads}
              onEditLead={(lead) => setEditingLead(lead)}
              onExportCSV={exportToCSV}
            />
          </div>
        )}
      </main>

      {/* HUMAN-IN-THE-LOOP GLASSMORPHIC MODAL */}
      {editingLead && (
        <LeadEditModal 
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onUpdate={handleUpdateLead}
          onDelete={handleDeleteLead}
        />
      )}
    </>
  );
}

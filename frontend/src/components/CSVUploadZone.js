import { useState, useCallback, useRef } from 'react';

export default function CSVUploadZone({ leadsCount, onBack, onImportFinished, groqKey }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  const fileInputRef = useRef(null);

  const downloadSampleCSV = () => {
    const csvContent = 
      "Date Created,Client Name,Primary Email,Contact Phone,Firm,City Name,Remarks,Origin\n" +
      "2026/05/13,John Doe,john.doe@example.com; test@gmail.com,+91 9876543210,GrowEasy,Mumbai,Interested. Call tomorrow,leads_on_demand\n" +
      "2026-05-13 14:25:30,Sarah Johnson,sarah.johnson@example.com,+91-9876543211,Tech Solutions,Bangalore,\"Busy, didn't answer\",meridian_tower\n" +
      "2026/05/14,Invalid Row No Contacts,,,,Chennai,No email and no phone,eden_park\n" +
      "2026/05/14 14:30:15,Rajesh Patel,rajesh.patel@example.com,+91 9876543212,Startup Inc,Delhi,Not interested - wrong number,varah_swamy\n" +
      "2026/05/14 14:35:22,Priya Singh,priya.singh@example.com; office@ex.com,+91 9876543213; +91 9999988888,Enterprise Corp,Pune,\"Deal closed, paid successfully\",sarjapur_plots\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'messy_leads_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setErrorMessage('Please select a valid CSV file.');
      return;
    }
    setFile(selectedFile);
    setErrorMessage('');
    setParsedPreview(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse CSV file on server.');
      }

      const data = await response.json();
      setParsedPreview(data);
    } catch (err) {
      setErrorMessage(err.message);
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const startImport = async () => {
    if (!parsedPreview || !parsedPreview.rows) return;
    
    setIsImporting(true);
    setErrorMessage('');

    const rows = parsedPreview.rows;
    const headers = parsedPreview.headers;
    const batchSize = 25;
    const total = Math.ceil(rows.length / batchSize);
    
    setTotalBatches(total);
    setCurrentBatch(0);

    const accumulatedRecords = [];
    const accumulatedSkipped = [];

    const customHeaders = {
      'Content-Type': 'application/json',
    };
    if (groqKey.trim()) {
      customHeaders['x-groq-api-key'] = groqKey.trim();
    }

    try {
      for (let i = 0; i < rows.length; i += batchSize) {
        const batchRows = rows.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        setCurrentBatch(batchNum);

        const response = await fetch('http://localhost:5000/api/import-batch', {
          method: 'POST',
          headers: {
            ...customHeaders,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            batch: batchRows,
            headers: headers
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Batch ${batchNum} failed: ${errorData.error || 'Server error'}`);
        }

        const batchResult = await response.json();
        accumulatedRecords.push(...batchResult.records);
        accumulatedSkipped.push(...batchResult.skipped);

        if (batchNum < total) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }

      // Ingestion completed successfully
      onImportFinished(accumulatedRecords, accumulatedSkipped, rows.length);
      setParsedPreview(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  const clearUploadState = () => {
    setFile(null);
    setParsedPreview(null);
    setErrorMessage('');
  };

  return (
    <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Lead Ingestion Interface</h2>
        {leadsCount > 0 && !isImporting && (
          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={onBack}>
            Back to Dashboard
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="alert-message alert-error" style={{ marginBottom: '1.5rem' }}>
          <span style={{ flex: 1 }}>⚠️ {errorMessage}</span>
          <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      {/* Drag & Drop Area */}
      {!file && !isUploading && !isImporting && (
        <div>
          <div className="template-bar">
            <button className="link-btn" onClick={downloadSampleCSV}>
              ⬇️ Download Messy Sample CSV Template
            </button>
          </div>
          <div 
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="file-input"
              accept=".csv"
              onChange={handleFileChange}
            />
            <div className="drop-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="drop-zone-title">Drop your CSV file here</h3>
            <p className="drop-zone-desc">or click to browse from device (max 5MB)</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>Semantic Field Mapping</span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>Status Standardizations</span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--color-text-muted)' }}>Phone Cleansing</span>
            </div>
          </div>
        </div>
      )}

      {/* In-browser parsing loading state */}
      {isUploading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Parsing and preparing CSV columns...</p>
        </div>
      )}

      {/* Step 2: Show Preview & Step 3: Confirmation Button */}
      {file && parsedPreview && !isImporting && (
        <div>
          <div className="file-loaded-info">
            <div className="file-info-text">
              <span className="file-icon">📄</span>
              <div>
                <strong>{file.name}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                  {(file.size / 1024).toFixed(1)} KB • {parsedPreview.rows.length} rows loaded
                </div>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={clearUploadState}>
              Clear
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔍</span> CSV Preview (First 5 Rows)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
              This shows how the data looks raw in the CSV columns before LLM semantics mapping.
            </p>
            
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {parsedPreview.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsedPreview.rows.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {parsedPreview.headers.map((header, colIndex) => (
                        <td key={colIndex} title={row[header]}>
                          {row[header] !== undefined && row[header] !== null ? String(row[header]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={clearUploadState}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={startImport}>
              ⚡ Confirm & Run AI Importer
            </button>
          </div>
        </div>
      )}

      {/* AI Batch Processing progress */}
      {isImporting && (
        <div className="progress-card" style={{ margin: 0 }}>
          <div className="progress-header">
            <span style={{ fontWeight: 600 }}>🤖 Running AI Extraction & Cleansing...</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Batch {currentBatch} of {totalBatches} ({Math.round((currentBatch / totalBatches) * 100)}%)
            </span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-bar" 
              style={{ width: `${(currentBatch / totalBatches) * 100}%` }}
            ></div>
          </div>
          <div className="progress-status">
            Processing batch {currentBatch} using llama-3.3-70b-versatile. Do not close this browser window.
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';

const Dashboard = () => (
  <div className="fade-in">
    <h1>Dashboard</h1>
    <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="glass-card">
        <h3>Total Terms</h3>
        <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-light)' }}>10,000+</p>
        <p className="text-muted">Standardized financial terms</p>
      </div>
      <div className="glass-card">
        <h3>Documents Processed</h3>
        <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>1,234</p>
        <p className="text-muted">PDFs, DOCX, and more</p>
      </div>
      <div className="glass-card">
        <h3>API Requests</h3>
        <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent)' }}>5.2M</p>
        <p className="text-muted">Standardization calls this month</p>
      </div>
    </div>

    <div style={{ marginTop: '3rem' }}>
      <h2>Quick Actions</h2>
      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <button className="glass-card btn" style={{ textAlign: 'center', display: 'block' }}>
          <span style={{ fontSize: '2rem' }}>📄</span>
          <p>Upload Multi-Doc</p>
        </button>
        <button className="glass-card btn" style={{ textAlign: 'center', display: 'block' }}>
          <span style={{ fontSize: '2rem' }}>🌐</span>
          <p>Import from URL</p>
        </button>
        <button className="glass-card btn" style={{ textAlign: 'center', display: 'block' }}>
          <span style={{ fontSize: '2rem' }}>🔍</span>
          <p>Check Compliance</p>
        </button>
      </div>
    </div>
  </div>
);

const TermStandardizer = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStandardize = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/standardize/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <h1>Standardize Terminology</h1>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Input Text / Term</label>
          <textarea
            rows="4"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter financial text or terms here... e.g., 'The A-Shares market showed volatility...'"
          />
        </div>
        <button className="btn btn-primary" onClick={handleStandardize} disabled={loading}>
          {loading ? 'Processing...' : 'Standardize Now'}
        </button>
      </div>

      {result && (
        <div className="glass-card fade-in" style={{ marginTop: '2rem' }}>
          <h3>Standardized Output</h3>
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            whiteSpace: 'pre-wrap'
          }}>
            {result.standardized_text}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4>Detected Terminology Corrections</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {result.matches && result.matches.length > 0 ? result.matches.map((match, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: '4px solid var(--primary)'
                }}>
                  <div>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem' }}>{match.original}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>→ {match.standard}</span>
                    <span style={{ marginLeft: '1rem', fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>{match.type}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Confidence: {(match.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )) : (
                <p className="text-muted">No standardization required - all terms appear standard.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataImport = () => {
  const [url, setUrl] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const handleUrlImport = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/import/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: url, type: 'url' })
      });
      const data = await response.json();
      setImportResult({ type: 'url', ...data });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:8000/api/process/file', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setImportResult({ type: 'file', ...data });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="fade-in">
      <h1>Data Import</h1>

      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>URL / Web Content</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Fetch and process text content from any financial news or report URL.</p>
          <input
            type="text"
            placeholder="https://example.com/financial-report"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <button className="btn btn-primary" onClick={handleUrlImport} disabled={loading}>
            {loading ? 'Importing...' : 'Fetch Content'}
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Local File Processing</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Upload PDF or Markdown files for intelligent parsing and chunking.</p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: '1rem', border: 'none', padding: '0' }}
          />
          <button className="btn btn-primary" onClick={handleFileUpload} disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload & Parse'}
          </button>
        </div>
      </div>

      {importResult && (
        <div className="glass-card fade-in" style={{ marginTop: '2rem' }}>
          <h3>Import Success</h3>
          <div style={{ marginTop: '1rem', maxHeight: '400px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            <pre>{JSON.stringify(importResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

const TermBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const response = await fetch('http://localhost:8000/api/terms/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: searchTerm, top_k: 20 })
    });
    const data = await response.json();
    setResults(data.results || []);
  }

  return (
    <div className="fade-in">
      <h1>Term Base Explorer</h1>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search for terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
      </div>

      <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {results.flat().map((item, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.term}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type: {item.type}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const initData = async () => {
    setLoading(true);
    setStatus('Initializing...');
    try {
      const response = await fetch('http://localhost:8000/api/terms/init', { method: 'POST' });
      const data = await response.json();
      setStatus(`Success! Loaded ${data.count} terms.`);
    } catch (e) {
      setStatus('Error initializing data.');
    }
    setLoading(false);
  }

  return (
    <div className="fade-in">
      <h1>Settings</h1>
      <div className="glass-card">
        <h3>System Management</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Manage the vector database and term base initialization.</p>
        <button className="btn btn-primary" onClick={initData} disabled={loading}>
          {loading ? 'Initializing...' : 'Initialize / Reset Term Base Data'}
        </button>
        {status && <p style={{ marginTop: '1rem', color: status.includes('Success') ? 'var(--secondary)' : 'var(--accent)' }}>{status}</p>}
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'standardize': return <TermStandardizer />;
      case 'import': return <DataImport />;
      case 'terms': return <TermBase />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--gradient-main)', borderRadius: '8px' }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FinStd<span style={{ color: 'var(--primary-light)' }}>.AI</span></h2>
        </div>

        <nav>
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </div>
          <div
            className={`nav-item ${activeTab === 'standardize' ? 'active' : ''}`}
            onClick={() => setActiveTab('standardize')}
          >
            Standardize
          </div>
          <div
            className={`nav-item ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            Data Import
          </div>
          <div
            className={`nav-item ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Term Base
          </div>
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </div>
        </nav>
      </div>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

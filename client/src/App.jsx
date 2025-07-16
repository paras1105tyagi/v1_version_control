import { useState, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:5000';

const TABS = [
  'User: Signup',
  'User: Login',
  'User: Logout',
  'User: Delete',
  'Repo: Create',
  'Repo: List',
  'Repo: Delete',
  'Repo: Add File',
  'Repo: Commit',
  'Repo: Push',
  'Repo: Pull',
  'Repo: Log',
  'Repo: Show Diff',
  'Repo: View Files',
];

function getToken() {
  return localStorage.getItem('groot_token');
}
function setToken(token) {
  localStorage.setItem('groot_token', token);
}
function clearToken() {
  localStorage.removeItem('groot_token');
}

function renderDiff(diffArr) {
  return (
    <pre className="groot-diff">
      {diffArr.map((file, idx) => (
        <div key={file.path + idx}>
          <strong>{file.path}</strong>
          {file.diff.map((part, i) => (
            <span
              key={i}
              className={part.added ? 'added' : part.removed ? 'removed' : 'unchanged'}
            >
              {part.added ? '+' : part.removed ? '-' : ' '}{part.value}
            </span>
          ))}
        </div>
      ))}
    </pre>
  );
}

function renderLog(logArr) {
  if (!Array.isArray(logArr) || logArr.length === 0) return <div>No commits found.</div>;
  return (
    <div className="groot-log-list">
      {logArr.map((commit, idx) => (
        <div className="groot-log-card" key={commit.hash + idx}>
          <div><strong>Commit:</strong> <span className="groot-log-hash">{commit.hash}</span></div>
          <div><strong>Message:</strong> {commit.message}</div>
          <div><strong>Date:</strong> {commit.timeStamp}</div>
          <div><strong>Parent:</strong> {commit.parent || <span style={{color:'#888'}}>None</span>}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(TABS[0]);
  const [result, setResult] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [viewFilesRepo, setViewFilesRepo] = useState('');
  const [repoFiles, setRepoFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [diffResult, setDiffResult] = useState(null);
  const [logResult, setLogResult] = useState(null);

  // User: Signup
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');

  // User: Login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Repo: Create
  const [newRepo, setNewRepo] = useState('');

  // Repo: Add File
  const [addFileName, setAddFileName] = useState('');
  const [addFileContent, setAddFileContent] = useState('');

  // Repo: Commit
  const [commitMsg, setCommitMsg] = useState('');

  // Repo: Push/Pull
  const [pushPullRepo, setPushPullRepo] = useState('');

  // Repo: Delete
  const [deleteRepoId, setDeleteRepoId] = useState('');

  // Repo: Show Diff
  const [diffRepo, setDiffRepo] = useState('');
  const [diffCommit, setDiffCommit] = useState('');
  const [diffCommits, setDiffCommits] = useState([]);

  // Fetch repos for dropdowns
  useEffect(() => {
    if (tab.includes('Repo:')) {
      fetch(`${API}/repo/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setRepos(data) : setRepos([]));
    }
  }, [tab, result]);

  // Fetch commit hashes for diff when repo changes
  useEffect(() => {
    if (tab === 'Repo: Show Diff' && diffRepo) {
      fetch(`${API}/repo/${diffRepo}/log`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(r => r.json())
        .then(data => setDiffCommits(Array.isArray(data.log) ? data.log : []));
    } else {
      setDiffCommits([]);
    }
  }, [tab, diffRepo]);

  // Handlers for each tab
  async function handleSignup(e) {
    e.preventDefault();
    setResult('');
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: signupUser, password: signupPass })
    });
    const data = await res.json();
    setResult(res.ok ? 'Signup successful!' : data.error || data.message);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setResult('');
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUser, password: loginPass })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      setResult('Login successful!');
    } else {
      setResult(data.error || data.message);
    }
  }

  function handleLogout() {
    clearToken();
    setResult('Logged out!');
  }

  async function handleDeleteUser() {
    setResult('');
    const res = await fetch(`${API}/auth/user`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) {
      clearToken();
      setResult('User deleted!');
    } else {
      setResult(data.error || data.message);
    }
  }

  async function handleCreateRepo(e) {
    e.preventDefault();
    setResult('');
    const res = await fetch(`${API}/repo/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name: newRepo })
    });
    const data = await res.json();
    setResult(res.ok ? 'Repo created!' : data.error || data.message);
  }

  async function handleDeleteRepo(e) {
    e.preventDefault();
    setResult('');
    const res = await fetch(`${API}/repo/${deleteRepoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setResult(res.ok ? 'Repo deleted!' : data.error || data.message);
  }

  async function handleAddFile(e) {
    e.preventDefault();
    setResult('');
    if (!selectedRepo) return setResult('Select a repo');
    const res = await fetch(`${API}/repo/${selectedRepo}/add-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ fileName: addFileName, content: addFileContent })
    });
    const data = await res.json();
    if (res.ok) {
      setResult('File staged!');
      setAddFileName('');
      setAddFileContent('');
    } else {
      setResult(data.error || data.message);
    }
  }

  async function handleCommit(e) {
    e.preventDefault();
    setResult('');
    if (!selectedRepo) return setResult('Select a repo');
    const res = await fetch(`${API}/repo/${selectedRepo}/commit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ message: commitMsg })
    });
    const data = await res.json();
    setResult(res.ok ? 'Commit created!' : data.error || data.message);
  }

  async function handlePush(e) {
    e.preventDefault();
    setResult('');
    // Fetch the latest commit for the selected repo
    const logRes = await fetch(`${API}/repo/${pushPullRepo}/log`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const logData = await logRes.json();
    if (!logRes.ok || !Array.isArray(logData.log) || logData.log.length === 0) {
      setResult('No commits to push!');
      return;
    }
    const latestCommit = logData.log[logData.log.length - 1];
    // Collect all files from the latest commit
    const files = latestCommit.files.map(f => ({
      path: f.path,
      hash: f.hash,
      content: f.content,
    }));
    const res = await fetch(`${API}/repo/${pushPullRepo}/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ commit: latestCommit, files }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult('Repo pushed!');
      setPushPullRepo('');
    } else {
      setResult(data.error || data.message);
    }
  }

  async function handlePull(e) {
    e.preventDefault();
    setResult('');
    const res = await fetch(`${API}/repo/${pushPullRepo}/pull`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok) {
      setResult('Repo pulled!');
      setPushPullRepo('');
    } else {
      setResult(data.error || data.message);
    }
  }

  async function handleLog(e) {
    e.preventDefault();
    setResult('');
    setLogResult(null);
    if (!selectedRepo) return setResult('Select a repo');
    const res = await fetch(`${API}/repo/${selectedRepo}/log`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok && data.log) {
      setLogResult(data.log);
    } else {
      setResult(data.error || data.message);
    }
  }

  // Handler to view files in a repo
  async function handleViewFiles() {
    setShowFiles(false);
    setRepoFiles([]);
    setResult('');
    if (!viewFilesRepo) return;
    // Get latest commit for the repo
    const res = await fetch(`${API}/repo/${viewFilesRepo}/log`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.log) && data.log.length > 0) {
      const latestCommit = data.log[data.log.length - 1];
      setRepoFiles(latestCommit.files);
      setShowFiles(true);
    } else {
      setResult('No files found in repo.');
    }
  }

  // Handler for show diff (render pretty diff)
  async function handleShowDiff(e) {
    e.preventDefault();
    setResult('');
    setDiffResult(null);
    if (!diffRepo || !diffCommit) return setResult('Select repo and commit hash');
    const res = await fetch(`${API}/repo/${diffRepo}/diff/${diffCommit}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (res.ok && data.diffs) {
      setDiffResult(data.diffs);
      setResult('');
    } else {
      setDiffResult(null);
      setResult(data.error || data.message);
    }
  }

  // UI for each tab
  return (
    <div className="groot-dashboard">
      <h1>Groot Version Control Dashboard</h1>
      <nav className="groot-nav">
        {TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? 'active' : ''}
            onClick={() => { setTab(t); setResult(''); setDiffResult(null); setShowFiles(false); }}
          >
            {t}
          </button>
        ))}
      </nav>
      <main className="groot-main">
        {tab === 'User: Signup' && (
          <form onSubmit={handleSignup}>
            <input placeholder="Username" value={signupUser} onChange={e => setSignupUser(e.target.value)} />
            <input placeholder="Password" type="password" value={signupPass} onChange={e => setSignupPass(e.target.value)} />
            <button type="submit">Signup</button>
          </form>
        )}
        {tab === 'User: Login' && (
          <form onSubmit={handleLogin}>
            <input placeholder="Username" value={loginUser} onChange={e => setLoginUser(e.target.value)} />
            <input placeholder="Password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
            <button type="submit">Login</button>
          </form>
        )}
        {tab === 'User: Logout' && (
          <button onClick={handleLogout}>Logout</button>
        )}
        {tab === 'User: Delete' && (
          <button onClick={handleDeleteUser}>Delete My User</button>
        )}
        {tab === 'Repo: Create' && (
          <form onSubmit={handleCreateRepo}>
            <input placeholder="Repo Name" value={newRepo} onChange={e => setNewRepo(e.target.value)} />
            <button type="submit">Create Repo</button>
          </form>
        )}
        {tab === 'Repo: List' && (
          <div>
            <h3>Your Repos:</h3>
            <ul>
              {repos.map(r => <li key={r._id}>{r.name} (id: {r._id})</li>)}
            </ul>
          </div>
        )}
        {tab === 'Repo: Delete' && (
          <form onSubmit={handleDeleteRepo}>
            <select value={deleteRepoId} onChange={e => setDeleteRepoId(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <button type="submit">Delete Repo</button>
          </form>
        )}
        {tab === 'Repo: Add File' && (
          <form onSubmit={handleAddFile}>
            <select value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <input placeholder="File Name" value={addFileName} onChange={e => setAddFileName(e.target.value)} />
            <textarea placeholder="File Content" value={addFileContent} onChange={e => setAddFileContent(e.target.value)} />
            <button type="submit">Add File</button>
          </form>
        )}
        {tab === 'Repo: Commit' && (
          <form onSubmit={handleCommit}>
            <select value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <input placeholder="Commit Message" value={commitMsg} onChange={e => setCommitMsg(e.target.value)} />
            <button type="submit">Commit</button>
          </form>
        )}
        {tab === 'Repo: Push' && (
          <form onSubmit={handlePush}>
            <select value={pushPullRepo} onChange={e => setPushPullRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <button type="submit">Push</button>
          </form>
        )}
        {tab === 'Repo: Pull' && (
          <form onSubmit={handlePull}>
            <select value={pushPullRepo} onChange={e => setPushPullRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <button type="submit">Pull</button>
          </form>
        )}
        {tab === 'Repo: Log' && (
          <form onSubmit={handleLog}>
            <select value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <button type="submit">Show Log</button>
          </form>
        )}
        {tab === 'Repo: Log' && logResult && renderLog(logResult)}
        {tab === 'Repo: View Files' && (
          <div>
            <select value={viewFilesRepo} onChange={e => setViewFilesRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <button onClick={handleViewFiles}>View Files</button>
            {showFiles && repoFiles.length > 0 && (
              <div>
                <h3>Files in Latest Commit:</h3>
                <ul>
                  {repoFiles.map(f => (
                    <li key={f.path}>
                      <strong>{f.path}</strong>
                      <pre className="groot-file-content">{f.content}</pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showFiles && repoFiles.length === 0 && <div>No files in repo.</div>}
          </div>
        )}
        {tab === 'Repo: Show Diff' && (
          <form onSubmit={handleShowDiff}>
            <select value={diffRepo} onChange={e => setDiffRepo(e.target.value)}>
              <option value="">Select Repo</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
            <select value={diffCommit} onChange={e => setDiffCommit(e.target.value)}>
              <option value="">Select Commit Hash</option>
              {diffCommits.map(commit => <option key={commit.hash} value={commit.hash}>{commit.message}</option>)}
            </select>
            <button type="submit">Show Diff</button>
          </form>
        )}
        {diffResult && tab === 'Repo: Show Diff' && renderDiff(diffResult)}
        {result && <pre className="groot-result">{result}</pre>}
      </main>
    </div>
  );
}

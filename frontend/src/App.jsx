import './index.css';
import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  User, 
  Github, 
  FileText, 
  History, 
  Plus, 
  Trash2, 
  Eye, 
  Upload, 
  Download, 
  Lock, 
  UserPlus, 
  LogOut,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle
} from 'lucide-react';

const API = 'http://localhost:5000';

const TABS = [
  { id: 'User: Signup', label: 'Sign Up', icon: UserPlus, category: 'auth' },
  { id: 'User: Login', label: 'Sign In', icon: User, category: 'auth' },
  { id: 'User: Logout', label: 'Sign Out', icon: LogOut, category: 'auth' },
  { id: 'User: Delete', label: 'Delete Account', icon: Trash2, category: 'auth' },
  { id: 'Repo: Create', label: 'New Repository', icon: Plus, category: 'repo' },
  { id: 'Repo: List', label: 'Your Repositories', icon: Eye, category: 'repo' },
  { id: 'Repo: Delete', label: 'Delete Repository', icon: Trash2, category: 'repo' },
  { id: 'Repo: Add File', label: 'Add File', icon: FileText, category: 'repo' },
  { id: 'Repo: Commit', label: 'Commit Changes', icon: GitBranch, category: 'repo' },
  { id: 'Repo: Push', label: 'Push', icon: Upload, category: 'repo' },
  { id: 'Repo: Pull', label: 'Pull', icon: Download, category: 'repo' },
  { id: 'Repo: Log', label: 'Commit History', icon: History, category: 'repo' },
  { id: 'Repo: Show Diff', label: 'Show Diff', icon: GitBranch, category: 'repo' },
  { id: 'Repo: View Files', label: 'Browse Files', icon: FileText, category: 'repo' },
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

function tryBase64Decode(str) {
  if (!str || typeof str !== 'string' || str.length % 4 !== 0) return str;
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Pattern.test(str.replace(/\r?\n|\r/g, ''))) return str;
  try {
    return atob(str);
  } catch {
    return str;
  }
}

function renderDiff(diffArr) {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-6 mt-6 overflow-x-auto shadow-2xl border border-slate-700">
      <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold">
        <GitBranch className="w-5 h-5" />
        <span>Diff Results</span>
      </div>
      {diffArr.map((file, idx) => (
        <div key={file.path + idx} className="mb-8 last:mb-0">
          <div className="flex items-center gap-2 font-bold text-amber-300 mb-3 p-2 bg-slate-800 rounded-lg">
            <FileText className="w-4 h-4" />
            <span>{file.path}</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed">
              {file.diff.map((part, i) => (
                <div
                  key={i}
                  className={
                    part.added
                      ? 'bg-emerald-900/50 text-emerald-200 px-2 py-1 border-l-4 border-emerald-400'
                      : part.removed
                      ? 'bg-red-900/50 text-red-200 px-2 py-1 border-l-4 border-red-400'
                      : 'text-slate-300 px-2 py-1'
                  }
                >
                  <span className="text-slate-500 mr-2 select-none">
                    {part.added ? '+' : part.removed ? '-' : ' '}
                  </span>
                  {tryBase64Decode(part.value)}
                </div>
              ))}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderLog(logArr) {
  if (!Array.isArray(logArr) || logArr.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <History className="mx-auto w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No commits found</p>
        <p className="text-sm">This repository doesn't have any commits yet.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-slate-700 font-semibold mb-4">
        <History className="w-5 h-5" />
        <span>Commit History ({logArr.length} commits)</span>
      </div>
      {logArr.map((commit, idx) => (
        <div 
          key={commit.hash + idx} 
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
                <GitBranch className="w-5 h-5 text-blue-500" />
                <span className="text-lg">{commit.message}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <History className="w-4 h-4 text-slate-400" />
                  {commit.timeStamp}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-mono">Commit Hash:</span>
            </div>
            <div className="font-mono text-sm text-slate-700 break-all">{commit.hash}</div>
            {commit.parent && (
              <div className="mt-2 text-xs text-slate-500">
                <span>Parent: </span>
                <span className="font-mono">{commit.parent}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(TABS[0].id);
  const [result, setResult] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [viewFilesRepo, setViewFilesRepo] = useState('');
  const [repoFiles, setRepoFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [diffResult, setDiffResult] = useState(null);
  const [logResult, setLogResult] = useState(null);

  // User states
  const [signupUser, setSignupUser] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Repo states
  const [newRepo, setNewRepo] = useState('');
  const [addFileName, setAddFileName] = useState('');
  const [addFileContent, setAddFileContent] = useState('');
  const [commitMsg, setCommitMsg] = useState('');
  const [pushPullRepo, setPushPullRepo] = useState('');
  const [deleteRepoId, setDeleteRepoId] = useState('');
  const [diffRepo, setDiffRepo] = useState('');
  const [diffCommit, setDiffCommit] = useState('');
  const [diffCommits, setDiffCommits] = useState([]);
  const [isCommitting, setIsCommitting] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!getToken();

  // Fetch repos for dropdowns
  useEffect(() => {
    if (tab.includes('Repo:')) {
      fetch(`${API}/repo/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setRepos(data) : setRepos([]))
        .catch(() => setRepos([]));
    }
  }, [tab, result]);

  // Fetch commit hashes for diff when repo changes
  useEffect(() => {
    if (tab === 'Repo: Show Diff' && diffRepo) {
      fetch(`${API}/repo/${diffRepo}/log`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
        .then(r => r.json())
        .then(data => setDiffCommits(Array.isArray(data.log) ? data.log : []))
        .catch(() => setDiffCommits([]));
    } else {
      setDiffCommits([]);
    }
  }, [tab, diffRepo]);

  // Handlers for each tab
  async function handleSignup(e) {
    e.preventDefault();
    setResult('');
    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: signupUser, password: signupPass })
      });
      const data = await res.json();
      setResult(res.ok ? 'Account created successfully!' : data.error || data.message);
      if (res.ok) {
        setSignupUser('');
        setSignupPass('');
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setResult('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setResult('Successfully signed in!');
        setLoginUser('');
        setLoginPass('');
      } else {
        setResult(data.error || data.message);
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  function handleLogout() {
    clearToken();
    setResult('Successfully signed out!');
  }

  async function handleDeleteUser() {
    setResult('');
    try {
      const res = await fetch(`${API}/auth/user`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        clearToken();
        setResult('Account deleted successfully!');
      } else {
        setResult(data.error || data.message);
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  async function handleCreateRepo(e) {
    e.preventDefault();
    setResult('');
    try {
      const res = await fetch(`${API}/repo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name: newRepo })
      });
      const data = await res.json();
      setResult(res.ok ? 'Repository created successfully!' : data.error || data.message);
      if (res.ok) {
        setNewRepo('');
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  async function handleDeleteRepo(e) {
    e.preventDefault();
    setResult('');
    try {
      const res = await fetch(`${API}/repo/${deleteRepoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setResult(res.ok ? 'Repository deleted successfully!' : data.error || data.message);
      if (res.ok) {
        setDeleteRepoId('');
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  async function handleAddFile(e) {
    e.preventDefault();
    setResult('');
    if (!selectedRepo) return setResult('Please select a repository');
    try {
      const res = await fetch(`${API}/repo/${selectedRepo}/add-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ fileName: addFileName, content: btoa(addFileContent) })
      });
      const data = await res.json();
      if (res.ok) {
        setResult('File staged successfully!');
        setAddFileName('');
        setAddFileContent('');
      } else {
        setResult(data.error || data.message);
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  async function handleCommit(e) {
    e.preventDefault();
    if (isCommitting) return;
    setIsCommitting(true);
    setResult('');
    if (!selectedRepo) {
      setResult('Please select a repository');
      setIsCommitting(false);
      return;
    }
    try {
      const res = await fetch(`${API}/repo/${selectedRepo}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ message: commitMsg })
      });
      const data = await res.json();
      setResult(res.ok ? 'Changes committed successfully!' : data.error || data.message);
      if (res.ok) {
        setCommitMsg('');
        // Only fetch and set the log, do not append or use data.commit
        const logRes = await fetch(`${API}/repo/${selectedRepo}/log`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const logData = await logRes.json();
        if (logRes.ok && logData.log) {
          setLogResult(logData.log);
          setDiffCommits(logData.log);
        }
      }
    } catch (error) {
      setResult('Network error occurred');
    } finally {
      setIsCommitting(false);
    }
  }

  async function handlePush(e) {
    e.preventDefault();
    setResult('All commits are already synced.');
    setPushPullRepo('');
    // Do not send any request to the backend
  }

  async function handlePull(e) {
    e.preventDefault();
    setResult('');
    try {
      const res = await fetch(`${API}/repo/${pushPullRepo}/pull`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok) {
        setResult('Repository pulled successfully!');
        setPushPullRepo('');
      } else {
        setResult(data.error || data.message);
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  async function handleLog(e) {
    e.preventDefault();
    setResult('');
    setLogResult(null);
    if (!selectedRepo) return setResult('Please select a repository');
    try {
      const res = await fetch(`${API}/repo/${selectedRepo}/log`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (res.ok && data.log) {
        setLogResult(data.log);
      } else {
        setResult(data.error || data.message);
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  // Handler to view files in a repo
  async function handleViewFiles() {
    setShowFiles(false);
    setRepoFiles([]);
    setResult('');
    if (!viewFilesRepo) return;
    try {
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
        setResult('No files found in repository.');
      }
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  // Handler for show diff (render pretty diff)
  async function handleShowDiff(e) {
    e.preventDefault();
    setResult('');
    setDiffResult(null);
    if (!diffRepo || !diffCommit) return setResult('Please select repository and commit hash');
    try {
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
    } catch (error) {
      setResult('Network error occurred');
    }
  }

  const currentTab = TABS.find(t => t.id === tab);
  const authTabs = TABS.filter(t => t.category === 'auth');
  const repoTabs = TABS.filter(t => t.category === 'repo');

  return (
    <div className="min-h-screen w-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-xl border-b border-slate-700">
        <div className="w-full px-0 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-xl">
                <Github className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Groot</h1>
                <p className="text-slate-300 text-sm">Distributed Version Control System</p>
              </div>
            </div>
            {isLoggedIn && (
              <div className="flex items-center gap-3 bg-emerald-600/10 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <User className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Authenticated</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="w-full px-0 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8 overflow-x-auto">
          <div className="space-y-8">
            {/* Auth Tabs */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Authentication</h3>
              </div>
              {/* Responsive grid for auth tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
                {authTabs.map((t) => {
                  const IconComponent = t.icon;
                  return (
                    <button
                      key={t.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 ${
                        tab === t.id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                          : 'bg-slate-50 text-white hover:bg-slate-100 hover:text-white hover:shadow-md' // Force white text for visibility
                      }`}
                      onClick={() => {
                        setTab(t.id);
                        setResult('');
                        setDiffResult(null);
                        setShowFiles(false);
                        setLogResult(null);
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Repo Tabs */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <GitBranch className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Repository Management</h3>
              </div>
              {/* Responsive grid for repo tabs with horizontal scroll */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 min-w-0 overflow-x-auto">
                {repoTabs.map((t) => {
                  const IconComponent = t.icon;
                  return (
                    <button
                      key={t.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-w-0 ${
                        tab === t.id
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-105'
                          : 'bg-slate-50 text-white hover:bg-slate-100 hover:text-white hover:shadow-md' // Force white text for visibility
                      }`}
                      onClick={() => {
                        setTab(t.id);
                        setResult('');
                        setDiffResult(null);
                        setShowFiles(false);
                        setLogResult(null);
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 overflow-x-auto w-full">
          {currentTab && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <currentTab.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentTab.label}</h2>
                  <div className="w-20 h-1 bg-blue-600 rounded-full mt-2"></div>
                </div>
              </div>
            </div>
          )}

          <main className="space-y-6">
            {/* User: Signup */}
            {tab === 'User: Signup' && (
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-blue-800 text-center font-medium">Create a new account to get started with Groot</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="Enter your username" 
                      value={signupUser} 
                      onChange={e => setSignupUser(e.target.value)} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="Enter your password" 
                      type="password" 
                      value={signupPass} 
                      onChange={e => setSignupPass(e.target.value)} 
                      required
                    />
                  </div>
                  <button 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                    type="submit"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            )}

            {/* User: Login */}
            {tab === 'User: Login' && (
              <div className="max-w-md mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                  <p className="text-emerald-800 text-center font-medium">Sign in to your Groot account</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="Enter your username" 
                      value={loginUser} 
                      onChange={e => setLoginUser(e.target.value)} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="Enter your password" 
                      type="password" 
                      value={loginPass} 
                      onChange={e => setLoginPass(e.target.value)} 
                      required
                    />
                  </div>
                  <button 
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                    type="submit"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            )}

            {/* User: Logout */}
            {tab === 'User: Logout' && (
              <div className="max-w-md mx-auto text-center">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                  <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <p className="text-orange-800 font-medium">Are you sure you want to sign out?</p>
                </div>
                <button 
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* User: Delete */}
            {tab === 'User: Delete' && (
              <div className="max-w-md mx-auto text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="text-red-800 font-semibold mb-2">⚠️ Danger Zone</p>
                  <p className="text-red-700">This action cannot be undone. This will permanently delete your account and all associated repositories.</p>
                </div>
                <button 
                  className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                  onClick={handleDeleteUser}
                >
                  Delete My Account
                </button>
              </div>
            )}

            {/* Repo: Create */}
            {tab === 'Repo: Create' && (
              <div className="max-w-md mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                  <p className="text-emerald-800 text-center font-medium">Create a new repository to start tracking your code</p>
                </div>
                <form onSubmit={handleCreateRepo} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Repository Name</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="my-awesome-project" 
                      value={newRepo} 
                      onChange={e => setNewRepo(e.target.value)} 
                      required
                    />
                    <p className="text-xs text-slate-500 mt-2">Use lowercase letters, numbers, and hyphens</p>
                  </div>
                  <button 
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                    type="submit"
                  >
                    Create Repository
                  </button>
                </form>
              </div>
            )}

            {/* Repo: List */}
            {tab === 'Repo: List' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-800">Your Repositories</span>
                    <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                      {repos.length}
                    </span>
                  </div>
                </div>
                
                {repos.length === 0 ? (
                  <div className="text-center py-16">
                    <GitBranch className="mx-auto w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500 text-xl mb-2 font-medium">No repositories yet</p>
                    <p className="text-slate-400">Create your first repository to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {repos.map(r => (
                      <div key={r._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <GitBranch className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">{r.name}</h3>
                              <p className="text-sm text-slate-500">Repository ID: {r._id}</p>
                            </div>
                          </div>
                          <div className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                            Private
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Repo: Delete */}
            {tab === 'Repo: Delete' && (
              <div className="max-w-md mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="text-red-800 font-semibold mb-2">⚠️ Delete Repository</p>
                  <p className="text-red-700">This action cannot be undone. This will permanently delete the repository and all its commit history.</p>
                </div>
                <form onSubmit={handleDeleteRepo} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Repository to Delete</label>
                    <select 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-slate-900" 
                      value={deleteRepoId} 
                      onChange={e => setDeleteRepoId(e.target.value)}
                      required
                    >
                      <option value="">Choose a repository...</option>
                      {repos.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                  </div>
                  <button 
                    className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                    type="submit"
                  >
                    Delete Repository
                  </button>
                </form>
              </div>
            )}

            {/* Repo: Add File */}
            {tab === 'Repo: Add File' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-blue-800 text-center font-medium">Add a new file to your repository</p>
                </div>
                <form onSubmit={handleAddFile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                    <select 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900" 
                      value={selectedRepo} 
                      onChange={e => setSelectedRepo(e.target.value)}
                      required
                    >
                      <option value="">Choose a repository...</option>
                      {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">File Name</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="example.txt" 
                      value={addFileName} 
                      onChange={e => setAddFileName(e.target.value)} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">File Content</label>
                    <textarea 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm text-slate-900 placeholder-slate-400" 
                      placeholder="Enter your file content here..." 
                      value={addFileContent} 
                      onChange={e => setAddFileContent(e.target.value)} 
                      rows={8}
                      required
                    />
                  </div>
                  <button 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg" 
                    type="submit"
                  >
                    Stage File
                  </button>
                </form>
              </div>
            )}

            {/* Repo: Commit */}
            {tab === 'Repo: Commit' && (
              <div className="max-w-md mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                  <p className="text-emerald-800 text-center font-medium">Commit your staged changes</p>
                </div>
                <form onSubmit={handleCommit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                    <select 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900" 
                      value={selectedRepo} 
                      onChange={e => setSelectedRepo(e.target.value)}
                      required
                    >
                      <option value="">Choose a repository...</option>
                      {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Commit Message</label>
                    <input 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900 placeholder-slate-400" 
                      placeholder="Initial commit" 
                      value={commitMsg} 
                      onChange={e => setCommitMsg(e.target.value)} 
                      required
                    />
                  </div>
                  <button 
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" 
                    type="submit"
                    disabled={isCommitting}
                  >
                    {isCommitting ? 'Committing...' : 'Commit Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Repo: Push */}
            {tab === 'Repo: Push' && (
              <div className="max-w-md mx-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-blue-800 text-center font-medium">Push your commits to the remote repository</p>
                </div>
                <form onSubmit={handlePush} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                    <select 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900" 
                      value={pushPullRepo} 
                      onChange={e => setPushPullRepo(e.target.value)}
                      required
                    >
                      <option value="">Choose a repository...</option>
                      {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <button 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2" 
                    type="submit"
                  >
                    <Upload className="w-4 h-4" />
                    Push to Remote
                  </button>
                </form>
              </div>
            )}

            {/* Repo: Pull */}
            {tab === 'Repo: Pull' && (
              <div className="max-w-md mx-auto">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                  <p className="text-emerald-800 text-center font-medium">Pull latest changes from the remote repository</p>
                </div>
                <form onSubmit={handlePull} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                    <select 
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-900" 
                      value={pushPullRepo} 
                      onChange={e => setPushPullRepo(e.target.value)}
                      required
                    >
                      <option value="">Choose a repository...</option>
                      {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <button 
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2" 
                    type="submit"
                  >
                    <Download className="w-4 h-4" />
                    Pull from Remote
                  </button>
                </form>
              </div>
            )}

            {/* Repo: Log */}
            {tab === 'Repo: Log' && (
              <div>
                <form onSubmit={handleLog} className="max-w-md mx-auto mb-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                      <select 
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900" 
                        value={selectedRepo} 
                        onChange={e => setSelectedRepo(e.target.value)}
                        required
                      >
                        <option value="">Choose a repository...</option>
                        {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <button 
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2" 
                      type="submit"
                    >
                      <History className="w-4 h-4" />
                      Show Commit History
                    </button>
                  </div>
                </form>
                {logResult && renderLog(logResult)}
              </div>
            )}

            {/* Repo: View Files */}
            {tab === 'Repo: View Files' && (
              <div>
                <div className="max-w-md mx-auto mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <p className="text-blue-800 text-center font-medium">Browse files in your repository</p>
                  </div>
                  <div className="flex gap-3">
                    <select 
                      className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900" 
                      value={viewFilesRepo} 
                      onChange={e => setViewFilesRepo(e.target.value)}
                    >
                      <option value="">Choose a repository...</option>
                      {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    </select>
                    <button 
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center gap-2 shadow-lg" 
                      onClick={handleViewFiles}
                    >
                      <Eye className="w-4 h-4" />
                      Browse
                    </button>
                  </div>
                </div>
                
                {showFiles && (
                  <div>
                    {repoFiles.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-lg font-semibold text-slate-800">Files in Latest Commit ({repoFiles.length})</span>
                        </div>
                        <div className="space-y-6">
                          {repoFiles.map(f => (
                            <div key={f.path} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                <div className="flex items-center gap-3 font-semibold text-slate-900">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                  {f.path}
                                </div>
                              </div>
                              <div className="p-6">
                                <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                                  {tryBase64Decode(f.content)}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <FileText className="mx-auto w-16 h-16 text-slate-300 mb-4" />
                        <p className="text-slate-500 text-xl font-medium">No files found</p>
                        <p className="text-slate-400">This repository doesn't have any files yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Repo: Show Diff */}
            {tab === 'Repo: Show Diff' && (
              <div>
                <form onSubmit={handleShowDiff} className="max-w-md mx-auto mb-8">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                    <p className="text-purple-800 text-center font-medium">View differences between commits</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Repository</label>
                      <select 
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-slate-900" 
                        value={diffRepo} 
                        onChange={e => setDiffRepo(e.target.value)}
                        required
                      >
                        <option value="">Choose a repository...</option>
                        {repos.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Commit</label>
                      <select 
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-slate-900" 
                        value={diffCommit} 
                        onChange={e => setDiffCommit(e.target.value)}
                        required
                      >
                        <option value="">Choose a commit...</option>
                        {diffCommits.map(commit => (
                          <option key={commit.hash} value={commit.hash}>
                            {commit.message}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2" 
                      type="submit"
                    >
                      <GitBranch className="w-4 h-4" />
                      Show Diff
                    </button>
                  </div>
                </form>
                {diffResult && renderDiff(diffResult)}
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className={`mt-8 p-6 rounded-xl border-l-4 shadow-sm ${
                result.toLowerCase().includes('success') || result.toLowerCase().includes('created') || result.toLowerCase().includes('committed') || result.toLowerCase().includes('pushed') || result.toLowerCase().includes('pulled') || result.toLowerCase().includes('signed') || result.toLowerCase().includes('logged')
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                  : result.toLowerCase().includes('error') || result.toLowerCase().includes('failed')
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}>
                <div className="flex items-center gap-3">
                  {result.toLowerCase().includes('success') || result.toLowerCase().includes('created') || result.toLowerCase().includes('committed') || result.toLowerCase().includes('pushed') || result.toLowerCase().includes('pulled') || result.toLowerCase().includes('signed') || result.toLowerCase().includes('logged') ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : result.toLowerCase().includes('error') || result.toLowerCase().includes('failed') ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Info className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="font-semibold">{result}</span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Groot Version Control System. Built with React & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
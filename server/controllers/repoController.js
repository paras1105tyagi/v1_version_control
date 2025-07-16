import Repo from '../models/Repo.js';
import fs from 'fs/promises';
import path from 'path';
import { diffLines } from 'diff';

// Create Repo
export const createRepo = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: 'Unauthorized: No user ID found.' });
  }
  const { name } = req.body;
  const repo = new Repo({ name, owner: req.userId, commits: [] });
  await repo.save();
  res.status(201).json({ message: 'Repo created', repo });
};

// List User's Repos
export const listRepos = async (req, res) => {
  const repos = await Repo.find({ owner: req.userId });
  res.json(repos);
};

// Delete Repo
export const deleteRepo = async (req, res) => {
  const deleted = await Repo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (deleted) {
    res.json({ message: 'Repo deleted' });
  } else {
    res.status(404).json({ error: 'Repo not found or not owned by user' });
  }
};

// Push Commit (basic endpoint — can be deprecated)
export const pushCommit = async (req, res) => {
  const { commit } = req.body;
  const repo = await Repo.findOne({ name: req.params.name, owner: req.userId });
  if (!repo) return res.status(404).json({ error: 'Repo not found' });
  repo.commits.push(commit);
  await repo.save();
  res.json({ message: 'Commit pushed' });
};

// ✅ Restore this (if needed by old routes)
export const pullCommits = async (req, res) => {
  const repo = await Repo.findOne({ name: req.params.name, owner: req.userId });
  if (!repo) return res.status(404).json({ error: 'Repo not found' });
  res.json({ commits: repo.commits });
};

// Push Full Repo
export const pushRepo = async (req, res) => {
  const { name } = req.params;
  const { commit, files } = req.body || {};

  if (!commit || !files) {
    return res.status(400).json({ message: 'Missing commit or files in request body.' });
  }

  try {
    const repo = await Repo.findOne({ name, owner: req.userId });
    if (!repo) return res.status(404).json({ message: 'Repo not found' });

    const enrichedFiles = commit.files.map(file => {
      const fullFile = files.find(f => f.hash === file.hash);
      if (!fullFile || !fullFile.content) {
        throw new Error(`Missing content for file with hash: ${file.hash}`);
      }
      return {
        ...file,
        content: fullFile.content || '', // keep as base64 string
      };
    });

    commit.files = enrichedFiles;
    repo.commits.push(commit);

    await repo.save();
    res.status(200).json({ message: 'Push successful' });

  } catch (err) {
    console.error('Push error:', err);
    res.status(500).json({ message: 'Push failed', error: err.message });
  }
};

// Pull Full Repo (includes file content)
export const pullRepo = async (req, res) => {
  const { name } = req.params;
 console.log('🔍 Pull request for repo:', name, 'by user:', req.userId);
  try {
    const repo = await Repo.findOne({ name, owner: req.userId });
    console.log("Found repo:", repo);
    if (!repo) return res.status(404).json({ message: 'Repo not found' });

    const updatedCommits = repo.commits.map(commit => ({
      ...commit.toObject(),
      files: commit.files.map(file => ({
        path: file.path,
        hash: file.hash,
        content: file.content || ''
      }))
    }));

    res.status(200).json({ commits: updatedCommits });
  } catch (err) {
    res.status(500).json({ message: 'Pull failed', error: err.message });
  }
};

// Add file to staging area
export const addFile = async (req, res) => {
  const { name } = req.params;
  const { fileName, content } = req.body;
  if (!fileName || typeof content !== 'string') {
    return res.status(400).json({ error: 'fileName and content required' });
  }
  const repo = await Repo.findOne({ name, owner: req.userId });
  if (!repo) return res.status(404).json({ error: 'Repo not found' });
  if (!repo.staging) repo.staging = [];
  // Replace if file already staged
  repo.staging = repo.staging.filter(f => f.path !== fileName);
  repo.staging.push({ path: fileName, hash: '', content });
  await repo.save();
  res.json({ message: 'File staged for commit' });
};

// Commit staged files
export const commitRepo = async (req, res) => {
  const { name } = req.params;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Commit message required' });
  const repo = await Repo.findOne({ name, owner: req.userId });
  if (!repo) return res.status(404).json({ error: 'Repo not found' });
  if (!repo.staging || repo.staging.length === 0) {
    return res.status(400).json({ error: 'No files staged' });
  }
  // Hash files (simple hash: content length + path)
  const files = repo.staging.map(f => ({
    path: f.path,
    hash: String(f.path.length + f.content.length),
    content: f.content
  }));
  const parent = repo.commits.length > 0 ? repo.commits[repo.commits.length - 1].hash : null;
  const commitData = {
    hash: String(Date.now()),
    message,
    timeStamp: new Date().toISOString(),
    parent,
    files
  };
  repo.commits.push(commitData);
  repo.staging = [];
  await repo.save();
  res.json({ message: 'Commit created', commit: commitData });
};

// Get commit log
export const logRepo = async (req, res) => {
  const { name } = req.params;
  const repo = await Repo.findOne({ name, owner: req.userId });
  if (!repo) return res.status(404).json({ error: 'Repo not found' });
  res.json({ log: repo.commits });
};

// Get diff for a commit
export const diffRepo = async (req, res) => {
  const { name, commitHash } = req.params;
  const repo = await Repo.findOne({ name, owner: req.userId });
  if (!repo) return res.status(404).json({ error: 'Repo not found' });
  const commit = repo.commits.find(c => c.hash === commitHash);
  if (!commit) return res.status(404).json({ error: 'Commit not found' });
  let parentCommit = null;
  if (commit.parent) {
    parentCommit = repo.commits.find(c => c.hash === commit.parent);
  }
  const diffs = [];
  for (const file of commit.files) {
    const parentFile = parentCommit ? parentCommit.files.find(f => f.path === file.path) : null;
    const oldContent = parentFile ? parentFile.content : '';
    const newContent = file.content;
    const diff = diffLines(oldContent, newContent);
    diffs.push({ path: file.path, diff });
  }
  res.json({ diffs });
};

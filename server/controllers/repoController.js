import Repo from '../models/Repo.js';
import fs from 'fs/promises';
import path from 'path';

// Create Repo
export const createRepo = async (req, res) => {
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
  await Repo.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ message: 'Repo deleted' });
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
  const { commit, files } = req.body;

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

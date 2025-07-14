// models/Repo.js
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  path: String,
  hash: String,
  content: String // <-- Add this!
});

const commitSchema = new mongoose.Schema({
  hash: String,
  message: String,
  timeStamp: String,
  parent: String,
  files: [fileSchema] // <-- Now includes content
});

const repoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  commits: [commitSchema]
});

export default mongoose.model('Repo', repoSchema);

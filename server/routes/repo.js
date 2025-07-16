import express from 'express';
import auth from '../middleware/auth.js';
import {
  createRepo,
  listRepos,
  deleteRepo,
  pushRepo,
  pullRepo,
  addFile,
  commitRepo,
  logRepo,
  diffRepo
} from '../controllers/repoController.js';

const router = express.Router();

router.post('/', auth, createRepo);
router.get('/', auth, listRepos);
router.delete('/:id', auth, deleteRepo);
router.post('/:name/push', auth, pushRepo);
router.get('/:name/pull', auth, pullRepo);
router.post('/:name/add-file', auth, addFile);
router.post('/:name/commit', auth, commitRepo);
router.get('/:name/log', auth, logRepo);
router.get('/:name/diff/:commitHash', auth, diffRepo);

export default router;
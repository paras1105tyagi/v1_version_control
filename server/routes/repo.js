import express from 'express';
import auth from '../middleware/auth.js';
import {
  createRepo,
  listRepos,
  deleteRepo,
  pushRepo,
  pullRepo
} from '../controllers/repoController.js';

const router = express.Router();

router.post('/', auth, createRepo);
router.get('/', auth, listRepos);
router.delete('/:id', auth, deleteRepo);
router.post('/:name/push', auth, pushRepo);
router.get('/:name/pull', auth, pullRepo);

export default router;
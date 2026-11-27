import { Router } from 'express';
import {
  extractVisit,
  createVisit,
  listVisits,
  getVisit,
} from '../controllers/visits.controller.js';

const router = Router();

router.post('/extract', extractVisit);
router.post('/', createVisit);
router.get('/', listVisits);
router.get('/:id', getVisit);

export default router;

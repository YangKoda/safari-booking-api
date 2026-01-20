import { Router } from 'express';
import { TourController } from '../controllers/TourController';

const router = Router();
const tourController = new TourController();

router.post('/', tourController.createTour);
router.get('/search', tourController.searchTours);
router.get('/', tourController.listTours);
router.get('/:id', tourController.getTour);

export { router as tourRoutes };

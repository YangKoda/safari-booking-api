import { Router } from 'express';
import { TourController } from '../controllers/TourController';
import { authenticate } from '@presentation/middleware/authenticate';
import { authorize } from '@presentation/middleware/authorize';

const router = Router();
const tourController = new TourController();

//  PUBLIC ROUTES
router.get('/', tourController.listTours);
router.get('/search', tourController.searchTours);
router.get('/:id', tourController.getTour);

// PROTECTED ROUTES (only admins/tour-guides can create tours)
router.post('/',authenticate, authorize('admin', 'tour-guide'),  tourController.createTour);


export { router as tourRoutes };

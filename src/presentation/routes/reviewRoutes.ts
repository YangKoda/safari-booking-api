import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';

const router = Router();
const reviewController = new ReviewController();

router.post('/', reviewController.createReview);
router.get('/', reviewController.listReviews);
router.get('/:id', reviewController.getReview);

export { router as reviewRoutes };

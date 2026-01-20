import { Router } from 'express';
import { InquiryController } from '../controllers/InquiryController';

const router = Router();
const inquiryController = new InquiryController();

router.post('/', inquiryController.createInquiry);
router.get('/', inquiryController.listInquiries);
router.get('/:id', inquiryController.getInquiry);
router.patch('/:id/confirm', inquiryController.confirmInquiry);
router.patch('/:id/cancel', inquiryController.cancelInquiry);

export { router as inquiryRoutes };

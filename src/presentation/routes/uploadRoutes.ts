import { Router } from 'express';
import { UploadController } from '@presentation/controllers/UploadController';
import { authenticate } from '@presentation/middleware/authenticate';
import { authorize } from '@presentation/middleware/authorize';
import { uploadSingle, uploadMultiple } from '@infrastructure/storage/MulterConfig';

const router = Router();
const uploadController = new UploadController();

// All upload routes require authentication
router.use(authenticate);

/**
 * Upload tour images (multiple)
 * POST /api/v1/upload/tours/:tourId/images
 * Authorization: admin, tour-guide
 * Body: multipart/form-data with 'images' field (max 5 files)
 */
router.post(
  '/tours/:tourId/images',
  authorize('admin', 'tour-guide'),
  uploadMultiple,
  uploadController.uploadTourImages
);

/**
 * Upload user avatar (single)
 * POST /api/v1/upload/users/avatar
 * Authorization: any authenticated user
 * Body: multipart/form-data with 'image' field
 */
router.post(
  '/users/avatar',
  uploadSingle,
  uploadController.uploadUserAvatar
);

export { router as uploadRoutes };

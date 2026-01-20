import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.post('/', userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);

export { router as userRoutes };

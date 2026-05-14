import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { TenantController } from './tenant.controller';
import { authMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { updateTenantSchema, updateTenantStatusSchema, createTenantSchema, resetOwnerPasswordSchema } from './tenant.schema';

const upload = multer({
  dest: 'uploads/tenant-logos/',
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG images are allowed'));
    }
  },
});

const router = Router();

// All tenant routes require SUPER_ADMIN
router.use(authMiddleware, roleMiddleware('SUPER_ADMIN'));

router.get('/', TenantController.list);
router.post('/', validate(createTenantSchema), TenantController.create);
router.get('/:id', TenantController.getOne);
router.put('/:id', validate(updateTenantSchema), TenantController.update);
router.patch('/:id/status', validate(updateTenantStatusSchema), TenantController.updateStatus);
router.post('/:id/impersonate', TenantController.impersonate);
router.patch('/:id/reset-password', validate(resetOwnerPasswordSchema), TenantController.resetOwnerPassword);
router.post('/:id/logo', upload.single('logo'), TenantController.uploadLogo);

export default router;

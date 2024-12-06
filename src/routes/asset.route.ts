import * as assetController from '@/controllers/asset.controller';
import express from 'express';

const router = express.Router();

router.get('/', assetController.getAssetByIds);

export default router;

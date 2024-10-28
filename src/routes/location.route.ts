import * as locationController from '@/controllers/location.controller';
import express from 'express';

const router = express.Router();

router.get('/provinces/all', locationController.getProvincesList);

router.get('/districts/all', locationController.getDistrictsList);

router.get('/wards/all', locationController.getWardsList);

router.get('/districts', locationController.getDistrictsByProvinceCode);

router.get('/wards', locationController.getWardsByDistrictCode);

router.get('/search', locationController.searchLocation);

export default router;

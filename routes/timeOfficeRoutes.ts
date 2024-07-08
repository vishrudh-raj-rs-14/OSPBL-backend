import express from 'express';
import {
  createtimeOffice,
  deletetimeOffice,
  getAlltimeOffices,
  gettimeOfficeRecordsOfDay,
  gettimeOfficebyId,
  updatetimeOffice,
} from '../controllers/timeOfficeController';
import { protect, restricTo } from '../controllers/userController';

const timeOfficeRouter = express.Router();

timeOfficeRouter.get(
  '/',
  // protect,
  // restricTo("ADMIN", "SECURITY"),
  gettimeOfficeRecordsOfDay
);
timeOfficeRouter.get('/all', protect, restricTo('ADMIN'), getAlltimeOffices);
timeOfficeRouter.get(
  '/today',
  protect,
  restricTo('ADMIN', 'SECURITY'),
  gettimeOfficeRecordsOfDay
);
timeOfficeRouter.get('/:id', protect, restricTo('ADMIN'), gettimeOfficebyId);

timeOfficeRouter.post(
  '/',
  protect,
  restricTo('ADMIN', 'SECURITY'),
  createtimeOffice
);
timeOfficeRouter.put('/:id', protect, restricTo('ADMIN'), updatetimeOffice);
timeOfficeRouter.delete('/:id', protect, restricTo('ADMIN'), deletetimeOffice);

export default timeOfficeRouter;

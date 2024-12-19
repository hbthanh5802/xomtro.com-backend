import { userDetailSchemaType, userSchemaType } from '@/types/schema.type';
import { Request } from 'express';

// Mở rộng module Express
declare module 'express-serve-static-core' {
  interface Request {
    currentUser?: {
      users: userSchemaType;
      users_detail: userDetailSchemaType;
    };
  }
}

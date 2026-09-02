import { Request } from 'express';

import { UserRole } from '../../users/entities/user.entity';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
}

export interface AuthenticatedRequest
  extends Request {
  user: AuthenticatedUser;
}
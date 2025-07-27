import { Request } from 'express';

export interface RequestWithUser extends Request {
  readonly user: {
    readonly userId: string;
  };
}

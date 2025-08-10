import { User } from '../entity';

export interface OperationResult {
  success: boolean;
  message: string;
  user: User;
}

export interface UpdateResult extends OperationResult {
  updatedFields: string[];
}

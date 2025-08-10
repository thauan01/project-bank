export class UpdateUserDto {
  name?: string;
  email?: string;
  address?: string;
  bankingDetails?: {
    agency?: string;
    accountNumber?: string;
  };
}

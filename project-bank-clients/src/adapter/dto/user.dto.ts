export class UserDto {
  name: string;
  email: string;
  document: string;
  balance?: number;
  address?: string;
  bankingDetails?: {
    agency?: string;
    accountNumber?: string;
  };
  profilePicture?: string;
}

export class UserDto {
  name?: string;
  email?: string;
  document?: string;
  address?: string;
  bankingDetails?: {
    agency?: string;
    accountNumber?: string;
  };
  profilePicture?: string;
}

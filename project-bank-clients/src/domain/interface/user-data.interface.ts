export interface UserData {
  name?: string;
  email?: string;
  document?: string;
  address?: string;
  balance?: number;
  agency?: string;
  accountNumber?: string;
  bankingDetails?: {
    agency?: string;
    accountNumber?: string;
  };
  profilePicture?: string;
}

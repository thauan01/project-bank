/**
 * Interface para dados bancários do usuário
 */
export interface BankingDetails {
  agency?: string;
  accountNumber?: string;
}

/**
 * Interface para dados bancários retornados pela API
 */
export interface BankingData {
  agency: string;
  accountNumber: string;
}

/**
 * Interface para dados do usuário completos retornados pela API de clientes
 */
export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  document: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bankingData: BankingData;
  timestamp?: string;
}

/**
 * Interface para criação/atualização de usuário na API de clientes
 */
export interface UserCreateUpdateData {
  name?: string;
  email?: string;
  document?: string;
  address?: string;
  profilePicture?: string;
  bankingDetails?: BankingDetails;
}

/**
 * Interface para o serviço de integração com a API de clientes
 */
export interface IUserIntegrationService {
  getUserById(userId: string): Promise<UserApiResponse>;
  createUser(userData: UserCreateUpdateData): Promise<UserApiResponse>;
  updateUser(userId: string, userData: UserCreateUpdateData): Promise<UserApiResponse>;
  updateProfilePicture(userId: string, profilePicture: string): Promise<UserApiResponse>;
  userExists(userId: string): Promise<boolean>;
  getUserBalance(userId: string): Promise<number>;
  getUserBankingData(userId: string): Promise<BankingData>;
}

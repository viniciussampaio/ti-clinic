import type { LoginCredentialsDto } from './dto/login-credentials.dto';
import type { RegisterLoginDto } from './dto/register-login.dto';
import type { LoginTokenResult, RegisterResult } from './types/auth-response.types';

export interface ILoginService {
  register(dto: RegisterLoginDto): Promise<RegisterResult>;
  login(dto: LoginCredentialsDto): Promise<LoginTokenResult>;
}

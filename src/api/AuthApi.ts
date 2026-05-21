import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import type { LoginResponse } from './types';

export class AuthApi extends ApiClient {

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/login`, {
      headers: this.headers(),
      data: { email, password },
    });
  }

  async getToken(email: string, password: string): Promise<string> {
    const response = await this.login(email, password);
    const body: LoginResponse = await response.json();
    if (!body.token) throw new Error(`Login failed — no token returned. Error: ${body.error}`);
    return body.token;
  }
}

import { APIRequestContext } from '@playwright/test';
import { config } from '../utils/config';

export abstract class ApiClient {
  protected readonly baseUrl: string;

  constructor(protected request: APIRequestContext) {
    this.baseUrl = config.apiBaseUrl;
  }

  protected headers(token?: string): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }
}

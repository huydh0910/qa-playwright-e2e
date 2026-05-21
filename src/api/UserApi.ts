import { APIResponse } from '@playwright/test';
import { ApiClient } from './ApiClient';
import type { GetUserResponse, UpdateUserRequest, UpdateUserResponse } from './types';

export class UserApi extends ApiClient {

  async getUser(userId: number, token: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/users/${userId}`, {
      headers: this.headers(token),
    });
  }

  async getUserData(userId: number, token: string): Promise<GetUserResponse> {
    const response = await this.getUser(userId, token);
    return response.json() as Promise<GetUserResponse>;
  }

  async updateUser(userId: number, body: UpdateUserRequest, token: string): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/users/${userId}`, {
      headers: this.headers(token),
      data: body,
    });
  }

  async updateUserData(userId: number, body: UpdateUserRequest, token: string): Promise<UpdateUserResponse> {
    const response = await this.updateUser(userId, body, token);
    return response.json() as Promise<UpdateUserResponse>;
  }

  async patchUser(userId: number, body: UpdateUserRequest, token: string): Promise<APIResponse> {
    return this.request.patch(`${this.baseUrl}/users/${userId}`, {
      headers: this.headers(token),
      data: body,
    });
  }
}

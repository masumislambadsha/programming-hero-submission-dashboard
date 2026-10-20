import type { ApiSuccess, LoginInput, SafeUser, SignupInput } from "@/types";
import apiClient from "@/lib/apiClient";

export function login(payload: LoginInput) {
  return apiClient<ApiSuccess<{ user: SafeUser }>>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function signup(payload: SignupInput) {
  return apiClient<ApiSuccess<{ user: SafeUser }>>("/auth/signup", {
    method: "POST",
    body: payload,
  });
}

export function logout() {
  return apiClient<ApiSuccess<null>>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiClient<ApiSuccess<{ user: SafeUser }>>("/auth/me");
}

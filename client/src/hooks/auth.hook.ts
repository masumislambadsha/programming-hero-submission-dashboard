"use client";

import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMe, login, logout, signup } from "@/api";
import { ApiRequestError } from "@/lib/apiClient";
import type { LoginInput, SafeUser, SignupInput } from "@/types";

/** Seeded demo accounts — also used by the one-click login buttons. */
export const DEMO_CREDENTIALS: Record<"STUDENT" | "MENTOR", LoginInput> = {
  STUDENT: { email: "rafi@student.com", password: "Student123!" },
  MENTOR: { email: "admin@programming-hero.com", password: "Mentor123!" },
};

export function useMe() {
  return useQuery<SafeUser>({
    queryKey: ["me"],
    queryFn: async () => (await getMe()).data.user,
    // A 401/403 is a definitive answer — retrying cannot help. Transient
    // failures (network blips, 5xx) get a couple of retries.
    retry: (failureCount, error) => {
      if (error instanceof ApiRequestError && [401, 403].includes(error.status)) return false;
      return failureCount < 2;
    },
    staleTime: 60_000,
  });
}

/**
 * Seed the ["me"] cache synchronously after login/signup, so guards and the
 * navbar see the new user immediately instead of flashing stale data while
 * the background refetch is in flight.
 */
export function seedMe(queryClient: QueryClient, user: SafeUser) {
  queryClient.setQueryData(["me"], user);
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginInput) => (await login(payload)).data.user,
    onSuccess: (user) => seedMe(queryClient, user),
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SignupInput) => (await signup(payload)).data.user,
    onSuccess: (user) => seedMe(queryClient, user),
  });
}

/** One-click demo login: plain async helper, same as the reference project. */
export async function demoLogin(role: "STUDENT" | "MENTOR"): Promise<SafeUser> {
  return (await login(DEMO_CREDENTIALS[role])).data.user;
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.removeQueries({ queryKey: ["submissions"] });
      queryClient.removeQueries({ queryKey: ["stats"] });
      router.replace("/login");
    },
  });
}

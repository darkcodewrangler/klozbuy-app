import { useSession } from "@/lib/auth-client";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  coverImageUrl?: string;
  username?: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
  };
}

export default useAuth;
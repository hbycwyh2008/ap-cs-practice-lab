"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User } from "@/lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout, setUser };
}

export function requireAuth(role?: "teacher" | "student") {
  return function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;
      if (!user) {
        router.push("/login");
        return;
      }
      if (role && user.role !== role) {
        router.push("/dashboard");
      }
    }, [user, loading, router]);

    return { user, loading };
  };
}

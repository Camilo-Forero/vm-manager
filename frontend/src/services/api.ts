import { VM } from "../types";

const API_BASE = "/api";

export async function loginUser(credentials: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
  return data;
}

export async function logoutUser() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Logout failed");
  }
  return data;
}

export async function checkAuth() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Not authenticated");
  }
  return data;
}

export async function fetchVMs(): Promise<{ vms: VM[] }> {
  const res = await fetch(`${API_BASE}/vms`, {
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch VMs");
  }
  return data;
}

export async function createVMAPI(vmData: Omit<VM, "id" | "createdAt" | "updatedAt">): Promise<{ vm: VM }> {
  const res = await fetch(`${API_BASE}/vms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vmData),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to create VM");
  }
  return data;
}

export async function updateVMAPI(id: number, vmData: Partial<VM>): Promise<{ vm: VM }> {
  const res = await fetch(`${API_BASE}/vms/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vmData),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update VM");
  }
  return data;
}

export async function deleteVMAPI(id: number): Promise<{ id: number }> {
  const res = await fetch(`${API_BASE}/vms/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete VM");
  }
  return data;
}

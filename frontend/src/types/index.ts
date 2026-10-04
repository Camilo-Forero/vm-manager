export type Role = "admin" | "client";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface VM {
  id: number;
  name: string;
  cores: number;
  ram: number; // in GB
  disk: number; // in GB
  os: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const prisma = new PrismaClient();

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type RegisterResponse = AuthResponse;
export type LoginResponse = AuthResponse;

const userRoles = Object.values(UserRole);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (
  body: Record<string, unknown>,
  key: string,
  label: string,
) => {
  const value = body[key];

  if (typeof value !== "string") {
    throw new AppError(400, `${label} is required`);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new AppError(400, `${label} is required`);
  }

  return trimmed;
};

const readEmail = (body: Record<string, unknown>) => {
  const email = readString(body, "email", "Email").toLowerCase();

  if (!email.includes("@")) {
    throw new AppError(400, "Valid email is required");
  }

  return email;
};

const readRole = (body: Record<string, unknown>) => {
  const role = readString(body, "role", "Role") as UserRole;

  if (!userRoles.includes(role)) {
    throw new AppError(400, "Valid role is required");
  }

  return role;
};

export const validateRegisterInput = (body: unknown): RegisterInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Request body is required");
  }

  const name = readString(body, "name", "Name");
  const email = readEmail(body);
  const password = readString(body, "password", "Password");

  if (password.length < 8) {
    throw new AppError(400, "Password must be at least 8 characters");
  }

  return {
    name,
    email,
    password,
    role: readRole(body),
  };
};

export const validateLoginInput = (body: unknown): LoginInput => {
  if (!isRecord(body)) {
    throw new AppError(400, "Request body is required");
  }

  return {
    email: readEmail(body),
    password: readString(body, "password", "Password"),
  };
};

const toAuthUser = (user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

const createToken = (user: { id: string; email: string; role: UserRole }) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

export const register = async (
  data: RegisterInput,
): Promise<RegisterResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(400, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      role: data.role,
    },
  });

  return {
    user: toAuthUser(user),
    token: createToken(user),
  };
};

export const login = async (data: LoginInput): Promise<LoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError(400, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.password_hash,
  );

  if (!passwordMatches) {
    throw new AppError(400, "Invalid email or password");
  }

  return {
    user: toAuthUser(user),
    token: createToken(user),
  };
};

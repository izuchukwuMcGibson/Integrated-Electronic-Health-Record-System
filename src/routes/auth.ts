import { Router, Response, Request } from "express";
import {
  register,
  login,
  validateRegisterInput,
  validateLoginInput,
  LoginResponse,
  RegisterResponse,
} from "../controllers/authController";
import { asyncHandler, ApiResponse } from "../middleware/errorHandler";

const router = Router();

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

router.post(
  "/signup",
  asyncHandler(
    async (req: Request, res: Response<ApiResponse<RegisterResponse>>) => {
      const result = await register(validateRegisterInput(req.body));

      setAuthCookie(res, result.token);

      res.status(201).json({
        success: true,
        data: result,
      });
    },
  ),
);

/**
 * POST /api/auth/login
 * Login with email and password
 * Returns JWT token and user info
 */
router.post(
  "/login",
  asyncHandler(
    async (req: Request, res: Response<ApiResponse<LoginResponse>>) => {
      const result = await login(validateLoginInput(req.body));

      setAuthCookie(res, result.token);

      res.json({
        success: true,
        data: result,
      });
    },
  ),
);

export default router;

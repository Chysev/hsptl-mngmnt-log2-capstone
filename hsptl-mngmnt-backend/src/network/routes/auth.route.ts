import {
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
  ForgotPasswordDTO,
} from "@/validators/auth.dto";
import { Router } from "express";
import { ExpressRouter } from "@/types/express-types";
import RequestValidator from "@/middleware/validator";
import AuthController from "../controllers/auth.controller";

const auth: ExpressRouter = Router();
const controller = new AuthController();

auth
  .route("/login")
  .post(
    RequestValidator.validate(LoginDTO),
    controller.Login
  );

auth
  .route("/verify2fa")
  .post(
    controller.Verify2fa
  );


auth
  .route("/register")
  .post(
    RequestValidator.validate(RegisterDTO),
    controller.Register
  );


auth.route("/session-token").get(controller.SessionToken);

auth
  .route("/forgot-password")
  .post(
    RequestValidator.validate(ForgotPasswordDTO),
    controller.ForgotPassword
  );


auth
  .route("/reset-password/:token")
  .post(
    RequestValidator.validate(ResetPasswordDTO),
    controller.ResetPassword
  );

export default auth;

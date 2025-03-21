import { Router } from "express";
import { ExpressRouter } from "@/types/express-types";
import RequestValidator from "@/middleware/validator";
import { MailConfigDTO } from "@/validators/config.dto";
import ConfigController from "../controllers/config.controller";
import { verifyAdminAuthToken } from "@/middleware/verifyAuthToken";

const config: ExpressRouter = Router();
const controller = new ConfigController();


config.route("/mail").get(verifyAdminAuthToken, controller.getMailConfig);


config
  .route("/setmail")
  .post(
    verifyAdminAuthToken,
    RequestValidator.validate(MailConfigDTO),
    controller.setMailConfig
  );

export default config;

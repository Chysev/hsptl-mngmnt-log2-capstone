import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import CertificateController from "../controllers/cert.controller";
import { CertificateDTO, UpdateCertificateDTO } from "@/validators/cert.dto";

const cert: ExpressRouter = Router()
const controller = new CertificateController()

cert.route("/create").post(
    RequestValidator.validate(CertificateDTO),
    controller.CreateCertificate)
cert.route("/update").patch(
    RequestValidator.validate(UpdateCertificateDTO),
    controller.UpdateCertificate)
cert.route("/delete/:id").delete(controller.DeleteCertificate)
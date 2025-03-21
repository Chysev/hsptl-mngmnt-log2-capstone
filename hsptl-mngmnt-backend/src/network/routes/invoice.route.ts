import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import InvoiceController from "../controllers/invoice.controller";
import { CreateInvoiceDTO, UpdateInvoiceDTO } from "@/validators/invoice.dto";


const inv: ExpressRouter = Router()
const controller = new InvoiceController()

inv.route("/create").post(RequestValidator.validate(CreateInvoiceDTO), controller.CreateInvoice)

inv.route("/update").post(RequestValidator.validate(UpdateInvoiceDTO), controller.UpdateInvoice)

inv.route("/delete/:id").post(controller.DeleteInvoice)


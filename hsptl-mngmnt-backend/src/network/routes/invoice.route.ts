import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import InvoiceController from "../controllers/invoice.controller";
import { CreateInvoiceDTO, UpdateInvoiceDTO } from "@/validators/invoice.dto";


const inv: ExpressRouter = Router()
const controller = new InvoiceController()


inv.route("/list").get(controller.getAllInvoice)

inv.route("/create").post(controller.CreateInvoice)

inv.route("/update").put(controller.UpdateInvoice)

inv.route("/delete/:id").delete(controller.DeleteInvoice)

export default inv;
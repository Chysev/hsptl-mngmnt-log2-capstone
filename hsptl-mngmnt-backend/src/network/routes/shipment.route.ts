import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import ShipmentController from "../controllers/shipment.controller";
import { CreateShipmentDTO, UpdateShipmentDTO } from "@/validators/shipment.dto";


const shipment: ExpressRouter = Router()
const controller = new ShipmentController()

shipment.route("/list").get(controller.getAllShipment)

shipment.route("/create").post(controller.CreateShipment)

shipment.route("/update").post(controller.UpdateShipment)

shipment.route("/delete/:id").post(controller.DeleteShipment)

export default shipment



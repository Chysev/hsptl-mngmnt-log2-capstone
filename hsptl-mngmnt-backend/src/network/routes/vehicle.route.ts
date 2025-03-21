import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import VehicleController from "../controllers/vehicle.controller";
import { CreateVehicleDTO, UpdateVehicleDTO } from "@/validators/vehicle.dto";


const vehicle: ExpressRouter = Router()
const controller = new VehicleController()


vehicle.route("/list").get(controller.getAllVehicle)

vehicle.route("/create").post(RequestValidator.validate(CreateVehicleDTO), controller.CreateVehicle)

vehicle.route("/update").post(RequestValidator.validate(UpdateVehicleDTO), controller.UpdateVehicle)

vehicle.route("/delete/:id").post(controller.DeleteVehicle)


export default vehicle
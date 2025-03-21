import Api from "@/lib/api";
import { HttpStatusCode } from "axios";
import { HttpInternalServerError } from "@/lib/error";
import VehicleService from "../services/vehicle.service";
import { Request, Response, NextFunction } from "@/types/express-types";

class VehicleController extends Api {
    private readonly vehicleService = new VehicleService();


    public getAllVehicle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicle = await this.vehicleService.getAllVehicle()
            this.send(res, vehicle, HttpStatusCode.Ok, "Get All Vehicle Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to get all vehicle"));
        }
    }

    public CreateVehicle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicle = await this.vehicleService.createVehicle(req.body)
            console.log(vehicle)
            this.send(res, vehicle, HttpStatusCode.Ok, "Create Vehicle Route")
        } catch (error) {
            console.log(error)
            next(new HttpInternalServerError("Failed to create vehicle"));
        }
    }

    public UpdateVehicle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicle = await this.vehicleService.updateVehicle(req.body)
            this.send(res, vehicle, HttpStatusCode.Ok, "Update Vehicle Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to update vehicle"));
        }
    }

    public DeleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicle = await this.vehicleService.deleteVehicle(req.params.id)
            this.send(res, vehicle, HttpStatusCode.Ok, "Delete Vehicle Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to delete vehicle"));
        }
    }
}

export default VehicleController;

import Api from "@/lib/api";
import { HttpStatusCode } from "axios";
import { HttpInternalServerError } from "@/lib/error";
import ShipmentService from "../services/shipment.service";
import { Request, Response, NextFunction } from "@/types/express-types";

class ShipmentController extends Api {
    private readonly shipmentService = new ShipmentService()


    public getAllShipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.shipmentService.getAllShipment()
            this.send(res, cert, HttpStatusCode.Ok, "Get All Shipment Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to Get All shipment"));
        }
    }


    public CreateShipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.shipmentService.createShipment(req.body)
            console.log(cert)
            this.send(res, cert, HttpStatusCode.Ok, "Create Shipment Route")
        } catch (error) {
            console.log(error)
            next(new HttpInternalServerError("Failed to create shipment"));
        }
    }

    public UpdateShipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.shipmentService.updateShipment(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Update Shipment Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to update shipment"));
        }
    }

    public DeleteShipment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.shipmentService.deleteShipment(req.params.id)
            this.send(res, cert, HttpStatusCode.Ok, "Delete Shipment Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to delete shipment"));
        }
    }
}

export default ShipmentController;

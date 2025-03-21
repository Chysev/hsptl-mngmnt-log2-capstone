import Api from "@/lib/api";
import { HttpStatusCode } from "axios";
import { HttpInternalServerError } from "@/lib/error";
import { Request, Response, NextFunction } from "@/types/express-types";
import OrdersService from "../services/orders.service";

class OrdersController extends Api {
    private readonly ordersService = new OrdersService()

    public getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.ordersService.getAllOrders()
            this.send(res, cert, HttpStatusCode.Ok, "List All Orders Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to create product"));
        }
    }

    public CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.ordersService.createOrders(req.body);
            console.log("✅ Product created or response ready");
            this.send(res, cert, HttpStatusCode.Ok, "Create Orders Route");
        } catch (error) {
            console.error("❌ Error in CreateProduct:", error);
            next(new HttpInternalServerError("Failed to create product"));
        }
    }

    public UpdateOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.ordersService.updateOrders(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Update Orders Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to update product"));
        }
    }

    public DeleteOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.ordersService.deleteOrders(req.params.id)
            this.send(res, cert, HttpStatusCode.Ok, "Delete Orders Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to delete product"));
        }
    }
}

export default OrdersController;

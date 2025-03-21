import Api from "@/lib/api";
import { HttpStatusCode } from "axios";
import { HttpInternalServerError } from "@/lib/error";
import { Request, Response, NextFunction } from "@/types/express-types";
import InvoiceService from "../services/invoice.service";

class InvoiceController extends Api {
    private readonly invoiceService = new InvoiceService();


    public CreateInvoice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.invoiceService.createInvoice(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Create Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to create certificate"));
        }
    }

    public UpdateInvoice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.invoiceService.updateInvoice(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Update Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to update certificate"));
        }
    }

    public DeleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.invoiceService.deleteInvoice(req.params.id)
            this.send(res, cert, HttpStatusCode.Ok, "Delete Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to delete certificate"));
        }
    }
}

export default InvoiceController;

import Api from "@/lib/api";
import { HttpStatusCode } from "axios";
import { HttpInternalServerError } from "@/lib/error";
import CertificateService from "../services/cert.service";
import { Request, Response, NextFunction } from "@/types/express-types";

class CertificateController extends Api {
    private readonly certificateService = new CertificateService();


    public CreateCertificate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.certificateService.createCertificate(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Create Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to create certificate"));
        }
    }

    public UpdateCertificate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.certificateService.updateCertificate(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Update Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to update certificate"));
        }
    }

    public DeleteCertificate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.certificateService.deleteCertificate(req.params.id)
            this.send(res, cert, HttpStatusCode.Ok, "Delete Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to delete certificate"));
        }
    }
}

export default CertificateController;

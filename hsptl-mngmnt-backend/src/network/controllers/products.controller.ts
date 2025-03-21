import Api from "@/lib/api";
import { HttpStatusCode } from "axios";
import { HttpInternalServerError } from "@/lib/error";
import ProductService from "../services/products.service";
import { Request, Response, NextFunction } from "@/types/express-types";

class ProductController extends Api {
    private readonly productService = new ProductService();


    public CreateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.productService.createProduct(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Create Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to create product"));
        }
    }

    public UpdateProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.productService.updateProducts(req.body)
            this.send(res, cert, HttpStatusCode.Ok, "Update Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to update product"));
        }
    }

    public DeleteProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cert = await this.productService.deleteProduct(req.params.id)
            this.send(res, cert, HttpStatusCode.Ok, "Delete Certificate Route")
        } catch (error) {
            next(new HttpInternalServerError("Failed to delete product"));
        }
    }
}

export default ProductController;

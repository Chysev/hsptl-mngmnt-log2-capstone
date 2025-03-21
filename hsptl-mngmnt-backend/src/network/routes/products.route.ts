import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { ExpressRouter } from "@/types/express-types.d";
import ProductController from "../controllers/products.controller";
import { CreateProductDTO, UpdateProductDTO } from "@/validators/products.dto";

const prod: ExpressRouter = Router()
const controller = new ProductController()


prod.route("/list").get(controller.getAllProduct)

prod.route("/create").post(RequestValidator.validate(CreateProductDTO), controller.CreateProduct)

prod.route("/update").patch(RequestValidator.validate(UpdateProductDTO), controller.UpdateProduct)

prod.route("/delete/:id").delete(controller.DeleteProduct)

export default prod
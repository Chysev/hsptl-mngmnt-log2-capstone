import { Router } from "express";
import RequestValidator from "@/middleware/validator";
import { DeleteUserDTO } from "@/validators/users.dto";
import { ExpressRouter } from "@/types/express-types.d";
import UsersController from "../controllers/users.controller";
import { verifyUserAuthToken } from "@/middleware/verifyAuthToken";

const users: ExpressRouter = Router();
const controller = new UsersController();


users
  .route("/list")
  .get(controller.getAllUsers);


users.route("/:id").get(controller.getUser);


// users
//   .route("/update/:id")
//   .patch(
//     verifyUserAuthToken,
//     RequestValidator.validate(UpdateUserDTO),
//     controller.UpdateUser
//   );


users
  .route("/delete/:id")
  .delete(
    verifyUserAuthToken,
    RequestValidator.validate(DeleteUserDTO),
    controller.DeleteUser
  );

export default users;

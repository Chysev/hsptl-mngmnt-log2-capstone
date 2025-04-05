import prisma from "@/lib/prisma";
import Bcrypt from "@/lib/bcrypt";
import { UpdateUserDTO } from "@/validators/users.dto";
import { HttpNotFoundError } from "@/lib/error";

class UserService {
  /**
   * Retrieves the details of all users.
   *
   * @public
   * @returns {Promise<Array<Object>>}
   */
  public getAllUsers() {
    return prisma.account.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        document: true,
        contract: true,
        role: true,
      },
    });
  }


  /**
   * Retrieves the details of a specific user by their ID.
   *
   * @public
   * @param {string} id
   * @returns {Promise<Object | null>}
   */
  public getUser(id: string) {
    return prisma.account.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        role: true,
      },
    });
  }

  /**
   * Updates the user profile with the given data.
   *
   * @public
   * @async
   * @param {string} id
   * @param {UpdateUserDTO} data
   * @returns {Promise<Object>}
   * @throws {Error}
   */

  public async updateUser(id: string, data: UpdateUserDTO) {
    const account = await prisma.account.findUnique({
      where: { id: id },
    });

    if (!account) {
      return new HttpNotFoundError("Account not found");
    }

    let updatedPassword = account.password;

    if (data.password) {
      updatedPassword = await Bcrypt.hashPassword(data.password);
    }

    return await prisma.account.update({
      where: {
        id: id,
      },
      data: {
        isVerfied: true
      },
    });
  }

  /**
   * Deletes a user by their ID.
   *
   * @public
   * @param {string} id
   * @returns {Promise<Object>}
   */
  public deleteUser(id: string) {
    return prisma.account.delete({
      where: { id: id },
    });
  }
}

export default UserService;

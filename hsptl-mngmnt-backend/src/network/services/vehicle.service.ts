import prisma from "@/lib/prisma";
import { CreateProductDTO, UpdateProductDTO } from "@/validators/products.dto";
import { CreateVehicleDTO, UpdateVehicleDTO } from "@/validators/vehicle.dto";

class VehicleService {

    public async getAllVehicle() {
        return prisma.vehicle.findMany()
    }

    public async createVehicle(data: CreateVehicleDTO) {
        const account = await prisma.account.findUnique({
            where: { id: data.account_id }
        })

        if (!account) {
            return { message: "Account Not Found" }
        }

        await prisma.vehicle.create({
            data: {
                name: data.name,
                driver_name: data.driver_name,
                plate_no: data.plate_no,
                status: data.status,
                account: {
                    connect: {
                        id: account.id
                    }
                }
            }
        })


        return {
            message: "Vehicle Created"
        }
    }

    public async updateVehicle(data: UpdateVehicleDTO) {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: data.id }
        })

        await prisma.vehicle.update({
            where: { id: vehicle?.id },
            data: {
                name: data.name || vehicle?.name,
                driver_name: data.driver_name || vehicle?.driver_name,
                plate_no: data.plate_no || vehicle?.plate_no,
                status: data.status || vehicle?.status,

            }
        })


        return {
            message: "Vehicle Updated Successfully"
        }
    }

    public async deleteVehicle(id: string) {
        await prisma.vehicle.delete({
            where: {
                id: id
            }
        })

        return {
            message: "Vehicle Deleted Successfully"
        }
    }
}

export default VehicleService;

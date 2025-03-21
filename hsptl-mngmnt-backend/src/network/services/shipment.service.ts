import prisma from "@/lib/prisma";
import { CreateShipmentDTO, UpdateShipmentDTO } from "@/validators/shipment.dto";

class ShipmentService {

    public async getAllShipment() {
        return await prisma.shipment.findMany({
            include: {
                orders: true
            }
        })
    }


    public async createShipment(data: CreateShipmentDTO) {
        await prisma.shipment.create({
            data: {
                destination: data.destination as string,
                start: new Date(data.start),
                end: new Date(data.end),
                description: data.description,
                vehicle: {
                    connect: {
                        id: data.vehicle_id,
                    }
                },
                orders: data.orders_id?.length
                    ? {
                        connect: data.orders_id.map((id) => ({ id })),
                    }
                    : undefined,
            }
        })

        return {
            message: "Shipment Created"
        }
    }


    public async updateShipment(data: UpdateShipmentDTO) {
        const shipment = await prisma.shipment.findUnique({
            where: { id: data.id }
        })

        if (!shipment) {
            return {
                message: "Shipment Not Found"
            }
        }
        await prisma.shipment.update({
            where: { id: shipment?.id },
            data: {
                destination: data.destination || shipment.destination,
                description: data.description || shipment.description,
                start: data.start || shipment.start,
                end: data.end || shipment.end
            }
        })

        return {
            message: "Shipment Updated Successfully"
        }
    }

    public async deleteShipment(id: string) {
        await prisma.shipment.delete({
            where: { id: id }
        })

        return {
            message: "Shipment Deleted Successfully"
        }
    }
}

export default ShipmentService;

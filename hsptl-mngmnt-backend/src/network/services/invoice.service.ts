import prisma from "@/lib/prisma";
import { CreateInvoiceDTO, UpdateInvoiceDTO } from "@/validators/invoice.dto";

class InvoiceService {
    public async getAllInvoice() {
        return await prisma.invoice.findMany({
            include: {
                account: true
            }
        })
    }

    public async createInvoice(data: CreateInvoiceDTO) {
        const account = await prisma.account.findUnique({
            where: { id: data.account_id }
        })

        if (!account) {
            return { message: "Account Not Found" }
        }

        await prisma.invoice.create({
            data: {
                amount: data.amount,
                status: data.status,
                issueDate: data.issueDate,
                account: {
                    connect: {
                        id: account.id
                    }
                }
            }
        })

        return {
            message: "Invoice Created"
        }
    }
    public async updateInvoice(data: UpdateInvoiceDTO) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: data.id }
        })

        if (!invoice) {
            return {
                message: "Invoice Not Found"
            }
        }

        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                amount: data.amount || invoice.amount,
                status: data.status || invoice.status,
                issueDate: data.issueDate || invoice.issueDate,
            }
        })
        return {
            message: "Invoice Created"
        }
    }

    public async deleteInvoice(id: string) {
        await prisma.invoice.delete({
            where: { id: id }
        })

        return {
            message: "Invoice Deleted Successfully"
        }
    }
}

export default InvoiceService;

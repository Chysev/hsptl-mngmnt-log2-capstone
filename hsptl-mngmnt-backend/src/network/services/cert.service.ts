import prisma from "@/lib/prisma";
import { CertificateDTO, UpdateCertificateDTO } from "@/validators/cert.dto";

class CertificateService {
    public async createCertificate(data: CertificateDTO) {
        const account = await prisma.account.findUnique({
            where: { id: data.account_id }
        })

        if (!account) {
            return { message: "Account Not Found" }
        }

        await prisma.certificate.create({
            data: {
                name: data.name,
                issued_by: data.issued_by,
                issueDate: data.issueDate,
                expiryDate: data.expiryDate,
                document_url: data.document_url,
                status: data.status,
                account: {
                    connect: {
                        id: data.account_id
                    }
                }
            }
        })

        return {
            message: "Certificate Created"
        }
    }

    public async updateCertificate(data: UpdateCertificateDTO) {
        const certificate = await prisma.certificate.findUnique({
            where: { id: data.id }
        })

        if (!certificate) {
            return {
                message: "Certificate Not Found"
            }
        }


        if (!data.account_id) {
            await prisma.$transaction(async (tx) => {
                await tx.certificate.update({
                    where: {
                        id: data.id
                    },
                    data: {
                        name: data.name || certificate?.name,
                        issued_by: data.issued_by || certificate?.issued_by,
                        issueDate: data.issueDate || certificate?.issueDate,
                        expiryDate: data.expiryDate || certificate?.expiryDate,
                        document_url: data.document_url || certificate?.document_url,
                        status: data.status || certificate?.status
                    }
                });

            });
        } else {
            const account = await prisma.account.findUnique({
                where: { id: data.account_id }
            })

            if (!account) {
                return {
                    message: "Account Not Found"
                }
            }

            await prisma.$transaction(async (tx) => {
                await tx.certificate.update({
                    where: {
                        id: data.id
                    },
                    data: {
                        name: data.name || certificate?.name,
                        issued_by: data.issued_by || certificate?.issued_by,
                        issueDate: data.issueDate || certificate?.issueDate,
                        expiryDate: data.expiryDate || certificate?.expiryDate,
                        document_url: data.document_url || certificate?.document_url,
                        status: data.status || certificate?.status
                    }
                });

            });
            if (data.account_id) {
                await prisma.certificate.update({
                    where: { id: data.id },
                    data: {
                        account: {
                            connect: {
                                id: account.id
                            }
                        }
                    }
                })
            }

        }

        return {
            message: "Certificate Updated Sucessfully"
        }

    }

    public async deleteCertificate(id: string) {
        await prisma.certificate.delete({
            where: { id: id }
        })

        return {
            message: "Certificate Deleted Successfully"
        }
    }
}

export default CertificateService;

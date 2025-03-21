import { InvoiceStatus } from "@prisma/client"
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator"

class CreateInvoiceDTO {
    @IsNotEmpty()
    @IsNumber()
    amount: number

    @IsEnum(InvoiceStatus)
    status: InvoiceStatus

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    issueDate: Date;

    @IsNotEmpty()
    @IsMongoId()
    account_id: string
}

class UpdateInvoiceDTO {
    @IsNotEmpty()
    @IsMongoId()
    id: string

    @IsOptional()
    @IsNumber()
    amount: number

    @IsEnum(InvoiceStatus)
    status: InvoiceStatus

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    issueDate: Date;

    @IsOptional()
    @IsMongoId()
    account_id: string
}

export { CreateInvoiceDTO, UpdateInvoiceDTO }
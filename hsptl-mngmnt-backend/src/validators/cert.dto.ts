import { Type } from "class-transformer";
import { CertStatus } from "@prisma/client";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

class CertificateDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    issued_by: string;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    issueDate: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    expiryDate?: Date;

    @IsOptional()
    @IsUrl()
    document_url: string

    @IsEnum(CertStatus)
    status: CertStatus;

    @IsNotEmpty()
    @IsMongoId()
    account_id: string
}

class UpdateCertificateDTO {
    @IsNotEmpty()
    @IsMongoId()
    id: string

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    issued_by: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    issueDate: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    expiryDate?: Date;

    @IsOptional()
    @IsUrl()
    document_url: string

    @IsEnum(CertStatus)
    status: CertStatus;

    @IsOptional()
    @IsMongoId()
    account_id: string
}

export { CertificateDTO, UpdateCertificateDTO }
import { VehicleStatus } from "@prisma/client"
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator"

class CreateVehicleDTO {
    @IsOptional()
    @IsString()
    name?: string

    @IsNotEmpty()
    @IsString()
    driver_name: string

    @IsOptional()
    @IsString()
    plate_no?: string

    @IsEnum(VehicleStatus)
    status: VehicleStatus

    @IsNotEmpty()
    @IsMongoId()
    account_id: string
}


class UpdateVehicleDTO {
    @IsNotEmpty()
    @IsMongoId()
    id: string

    @IsOptional()
    @IsString()
    name?: string

    @IsNotEmpty()
    @IsString()
    driver_name: string

    @IsOptional()
    @IsString()
    plate_no?: string

    @IsEnum(VehicleStatus)
    status: VehicleStatus
}

export { CreateVehicleDTO, UpdateVehicleDTO }
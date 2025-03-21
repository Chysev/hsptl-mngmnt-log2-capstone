import { Type } from 'class-transformer'
import {
    IsDate,
    IsString,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
    IsArray,
} from 'class-validator'
import { CreateOrdersDTO, OrderProductDTO } from './orders.dto'


class CreateShipmentDTO {
    @IsString()
    @IsNotEmpty()
    destination: string

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    start: Date

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    end: Date

    @IsString()
    @IsOptional()
    description?: string;

    @IsMongoId()
    @IsOptional()
    @IsArray()
    orders_id: string[]

    @IsMongoId()
    @IsOptional()
    vehicle_id?: string
}

class UpdateShipmentDTO {
    @IsString()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsOptional()
    destination?: string

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    start?: Date

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    end?: Date

    @IsString()
    @IsOptional()
    description?: string
}

export { CreateShipmentDTO, UpdateShipmentDTO }

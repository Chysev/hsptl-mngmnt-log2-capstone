import {
    IsArray,
    IsNotEmpty,
    IsString,
    IsMongoId,
    ValidateNested,
    IsNumber,
    Min,
    IsOptional,
} from 'class-validator'
import { Type } from 'class-transformer'

class OrderProductDTO {
    @IsString()
    @IsNotEmpty()
    productId: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsNumber()
    @Min(1)
    quantity: number

    @IsNumber()
    price: number
}

class CreateOrdersDTO {
    @IsMongoId()
    @IsNotEmpty()
    account_id: string

    @IsString()
    @IsNotEmpty()
    destination: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderProductDTO)
    products: OrderProductDTO[]
}


class UpdateOrdersDTO {
    @IsMongoId()
    @IsNotEmpty()
    id: string

    @IsString()
    @IsOptional()
    destination: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderProductDTO)
    @IsOptional()
    products?: OrderProductDTO[]
}

export { CreateOrdersDTO, UpdateOrdersDTO, OrderProductDTO }
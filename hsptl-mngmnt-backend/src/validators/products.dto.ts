import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

class CreateProductDTO {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNumber()
    price: number

    @IsNumber()
    stocks: number

    @IsNotEmpty()
    @IsMongoId()
    account_id: string
}

class UpdateProductDTO {
    @IsNotEmpty()
    @IsMongoId()
    id: string

    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @IsNumber()
    price: number

    @IsOptional()
    @IsNumber()
    stocks: number
}


export { CreateProductDTO, UpdateProductDTO }
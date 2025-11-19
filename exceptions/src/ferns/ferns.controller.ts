import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Put
} from "@nestjs/common";
import { FernsService } from "./ferns.service";
import { createFernDto, updateFernDto } from "./fern.dtos";
import z, { ZodError } from "zod";
import { NotFoundError } from "src/errors/not-found-error";
import { InvalidArgumentError } from "src/errors/invalid-argument-error";

@Controller("ferns")
export class FernsController {
    public constructor(private service: FernsService) {}

    @Get(":id")
    public async findById(@Param("id") id: string) {
        try {
            return { fern: await this.service.findById(id) }
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw new NotFoundException(error);
            }
            throw new InternalServerErrorException(error);
        }
    }

    @Get("")
    public async list() {
        try {
            return { ferns: await this.service.list() }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post("create")
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() body: object) {
        try {
            const dto = createFernDto.parse(body);
            const fern = await this.service.store(dto);
            return { fern };
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(z.treeifyError(error));
            }
            if (error instanceof InvalidArgumentError) {
                const zodLikeError = new ZodError([{
                    code: "custom",
                    path: [error.field],
                    message: error.message,
                }]);
                throw new BadRequestException(z.treeifyError(zodLikeError));
            }
            throw new InternalServerErrorException(error);
        }
    }

    @Delete("delete/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    public async delete(@Param("id") fernId: string) {
        try {
            await this.service.deleteById(fernId);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Put("update/:id")
    @HttpCode(HttpStatus.OK)
    public async update(@Param("id") id: string, @Body() body: object) {
        try {
            const data = updateFernDto.parse(body);
            const fern = await this.service.save({ id, ...data });
            return { fern };
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(z.treeifyError(error));
            }
            if (error instanceof NotFoundError) {
                throw new NotFoundException(error);
            }
            throw new InternalServerErrorException(error);
        }
    }
}

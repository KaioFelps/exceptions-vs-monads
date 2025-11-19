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
import { CreateFernDto, createFernDto, UpdateFernDto, updateFernDto } from "./fern.dtos";
import z, { ZodError } from "zod";
import { NotFoundError } from "src/errors/not-found-error";
import { InvalidArgumentError } from "src/errors/invalid-argument-error";
import { pipe } from "fp-ts/lib/function";
import { mapEitherIntoTE, teFromEP } from "src/lib/fp-ts";
import { either, option, taskEither } from "fp-ts";

@Controller("ferns")
export class FernsController {
    public constructor(private service: FernsService) {}

    @Get(":id")
    public async findById(@Param("id") id: string) {
        return await pipe(
            teFromEP(this.service.findById(id)),
            taskEither.match(
                (error) =>  {
                    if (error instanceof NotFoundError) {
                        throw new NotFoundException(error);
                    }
                    throw new InternalServerErrorException(error);
                },
                (fern) => ({ fern }),
            ))();
    }

    @Get("")
    public async list() {
        return await pipe(
            teFromEP(this.service.list()),
            taskEither.match(
                (error) => {
                    throw new InternalServerErrorException(error);
                },
                (ferns) => ({ ferns }),
            ))();
    }

    @Post("create")
    @HttpCode(HttpStatus.CREATED)
    public async create(@Body() body: object) {
        return await pipe(
            either.tryCatch(
                () => createFernDto.parse(body),
                (error) => error as ZodError<CreateFernDto>),
            mapEitherIntoTE(dto => this.service.store(dto)),
            taskEither.match(
                (error) => {
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
                },
                (fern) => ({ fern }),
            ))();
    }

    @Delete("delete/:id")
    @HttpCode(HttpStatus.NO_CONTENT)
    public async delete(@Param("id") fernId: string) {
        await pipe(
            teFromEP(this.service.deleteById(fernId)),
            taskEither.mapError((error) => {
                    throw new InternalServerErrorException(error);
                },
            ))();
    }

    @Put("update/:id")
    @HttpCode(HttpStatus.OK)
    public async update(@Param("id") id: string, @Body() body: object) {
        return await pipe(
            either.tryCatch(
                () => updateFernDto.parse(body),
                (error) => error as ZodError<UpdateFernDto>),
            mapEitherIntoTE((dto) => this.service.save({ id, ...dto })),
            taskEither.match(
                (error) => {
                    if (error instanceof ZodError) {
                        throw new BadRequestException(z.treeifyError(error));
                    }
                    if (error instanceof NotFoundError) {
                        throw new NotFoundException(error);
                    }
                    throw new InternalServerErrorException(error); 
                },
                (fern) => ({ fern }),
            ))();
    }
}

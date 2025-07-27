import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

export const ApiGenericResponse = <T extends Type<any>>(
  status: number,
  type: T,
  options?: { isArray?: boolean },
) => {
  const { isArray = false } = options || {};

  return applyDecorators(
    ApiExtraModels(ResponseDto, type) as ClassDecorator,
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(type) },
                  }
                : { $ref: getSchemaPath(type) },
            },
          },
        ],
      },
    }) as MethodDecorator,
  );
};

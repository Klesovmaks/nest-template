import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

export /**
 * Универсальный декоратор Swagger для описания generic response с вложенной структурой.
 * Позволяет описывать ответ, где data — либо объект, либо массив объектов указанного типа.
 *
 * @template {Type<any>} T - Тип данных внутри поля data
 * @param {number} status - HTTP статус ответа (например, 200)
 * @param {T} type - Класс (DTO), который описывает структуру данных data
 * @param {?{ isArray?: boolean }} [options] - Дополнительные опции, например, isArray для указания массива
 * @returns {*} - Комбинированный декоратор Swagger для метода контроллера
 */
const ApiGenericResponse = <T extends Type<any>>(
  status: number,
  type: T,
  options?: { isArray?: boolean },
) => {
  const { isArray = false } = options || {};

  return applyDecorators(
    // Добавляем модели ResponseDto и тип данных для корректного описания
    ApiExtraModels(ResponseDto, type) as ClassDecorator,
    // Описываем схему ответа с использованием allOf для комбинирования схемы ResponseDto
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

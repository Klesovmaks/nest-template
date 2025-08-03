import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ResponseDto<T> {
  @ApiProperty({
    description: 'Сообщение',
    type: String,
  })
  @IsString()
  readonly message: string;

  @ApiProperty({
    description: 'Код ответа',
    type: Number,
  })
  @IsNumber()
  readonly statusCode: number;

  @ApiProperty({
    description: 'Данные ответа',
    type: Object,
    required: false,
  })
  @IsOptional()
  readonly data?: T;

  @ApiProperty({
    description: 'Описание ошибки',
    type: String,
    required: false,
  })
  @IsOptional()
  readonly error?: string;
}

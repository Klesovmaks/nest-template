import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({
    description: 'Сообщение',
    type: String,
  })
  readonly message: string;

  @ApiProperty({
    description: 'Код ответа',
    type: Number,
  })
  readonly statusCode: number;

  @ApiProperty({
    description: 'Данные ответа',
    type: Object,
    required: false,
  })
  readonly data?: T;

  @ApiProperty({
    description: 'Описание ошибки',
    type: String,
    required: false,
  })
  readonly error?: string;
}

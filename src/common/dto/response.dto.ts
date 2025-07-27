import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({
    description: 'Сообщение',
    type: String,
  })
  @ApiProperty()
  readonly message: string;

  @ApiProperty({
    description: 'Код ответа',
    type: Number,
  })
  readonly statusCode: number;

  @ApiProperty()
  readonly data: T;
}

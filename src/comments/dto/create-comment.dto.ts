import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  author: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;
}

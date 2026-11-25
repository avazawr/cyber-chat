import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string | undefined) {
    if (value === undefined) return value;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(value) || isNaN(Date.parse(value))) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return value;
  }
}

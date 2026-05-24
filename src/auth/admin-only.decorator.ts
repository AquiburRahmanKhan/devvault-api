import { applyDecorators } from '@nestjs/common';
import { Roles } from './roles.decorator';

export function AdminOnly() {
  return applyDecorators(Roles('ADMIN'));
}

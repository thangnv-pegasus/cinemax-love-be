import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Role = (...args: number[] | string[]) => SetMetadata(ROLES_KEY, args);

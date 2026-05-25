import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const CurrentUser = createParamDecorator((field: string|undefined, ctx: ExecutionContext) => {
  const user = ctx.switchToHttp().getRequest().user;
  return field ? user?.[field] : user;
});

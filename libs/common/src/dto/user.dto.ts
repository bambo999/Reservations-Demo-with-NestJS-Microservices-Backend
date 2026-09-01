import { RoleDto } from './role.dto';

export interface UserDto {
  id?: number;
  _id?: string;
  email: string;
  password?: string;
  roles?: RoleDto[];
}


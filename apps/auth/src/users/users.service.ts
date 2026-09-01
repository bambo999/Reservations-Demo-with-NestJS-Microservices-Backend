import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { GetUserDto } from './dto/get-user.dto';
import { User } from './model/user.entity';
import { Role } from './model/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.validateCreateUserDto(createUserDto);
    const roles = await this.getRoles(createUserDto.roles);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.usersRepository.create(
      new User({
        ...createUserDto,
        password: hashedPassword,
        roles,
      }),
    );
  }

  private async getRoles(rolesDto?: RoleDto[]): Promise<Role[]> {
    if (!rolesDto || rolesDto.length === 0) {
      return [];
    }

    return Promise.all(
      rolesDto.map(async (roleDto) => {
        if (roleDto.id) {
          const existingById = await this.rolesRepository.findOne({
            where: { id: roleDto.id },
          });
          if (existingById) {
            return existingById;
          }
        }
        if (roleDto.name) {
          const existingByName = await this.rolesRepository.findOne({
            where: { name: roleDto.name },
          });
          if (existingByName) {
            return existingByName;
          }
          const newRole = this.rolesRepository.create(
            new Role({ name: roleDto.name }),
          );
          return this.rolesRepository.save(newRole);
        }
        return new Role(roleDto);
      }),
    );
  }

  private async validateCreateUserDto(createUserDto: CreateUserDto) {
    try {
      await this.usersRepository.findOne({ email: createUserDto.email });
    } catch (error) {
      return;
    }
    throw new UnprocessableEntityException('Email already exists.');
  }

  async verifyUser(email: string, password: string) {
    const user = await this.usersRepository.findOne({ email }, { roles: true });
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credentials are not valid');
    }
    return user;
  }

  async getUser(getUserDto: GetUserDto) {
    return this.usersRepository.findOne(getUserDto, { roles: true });
  }
}

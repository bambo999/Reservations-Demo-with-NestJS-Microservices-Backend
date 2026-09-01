import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
 import { UsersService } from './users.service';
 import { DatabaseModule } from '@app/common';
 import { User } from './model/user.entity';
 import { Role } from './model/role.entity';
 import { UsersRepository } from './users.repository';

@Module({
  imports: [DatabaseModule, DatabaseModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}


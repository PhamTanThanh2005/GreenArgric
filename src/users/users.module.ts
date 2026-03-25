import { Module } from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  imports: [
    JwtModule.register({
      secret : 'CHIA_KHOA', 
      signOptions : {expiresIn : '1h'}
    })
  ]
})
export class UsersModule {
}

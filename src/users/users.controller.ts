import { Controller, Get, Post,  Body, UseGuards, Req} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

// TODO 2: Import 'UsersService' từ file users.service.ts của bạn vào đây

@Controller('users')
export class UsersController {
  
  // TODO 3: Inject (tiêm) UsersService vào Controller thông qua constructor
  constructor(
    private readonly userService: UsersService
  ) {}

  @Get('health-check') 
  checkSystem() {
    return this.userService.checkSystem();
  }

  @Post('login')
  login(@Body() loginData : LoginDto){
    return this.userService.validateUser(loginData);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Req()  request :any) {
    return request.user;
  } 

  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('admin-dashboard')
  getAdminData(){
    return "Chào mừng sếp Admin đến với bảng điều khiển GREEN AGRIC!";
  }

  @Roles('chu_vuon')
  @UseGuards(AuthGuard('jwt'), UseGuards)
  @Get('dashboard')
  getGardenData(){
    return "Chào mừng Chủ vườn! Đây là trang quản lý nông trại của bạn.";
  }

}
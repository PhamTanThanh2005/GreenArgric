import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(private readonly jwtService: JwtService) {

    }
    checkSystem() {
        return "Hệ thống GREEN AGRIC đang hoạt động tốt!"
    }

    validateUser(loginData: LoginDto) {
        if (loginData.username == 'admin' && loginData.password == '123456') {

            const payload = {
                username: loginData.username,
                role: 'admin'
            }
            return {
                message: "Đăng nhập thành công",
                role: 'admin',
                access_token: this.jwtService.sign(payload)
            }
        }
        if (loginData.username == 'chuvuon' && loginData.password == '123456') {
            const payload = { username: loginData.username, role: 'chu_vuon' };
            return {
                message: "Đăng nhập thành công",
                role: 'chu_vuon',
                access_token: this.jwtService.sign(payload)
            };
        }
        throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');
    }
}

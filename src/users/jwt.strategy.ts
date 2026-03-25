import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // TODO 1: Dạy bác bảo vệ cách lấy token từ người dùng. 
      // Gợi ý: Gán jwtFromRequest bằng hàm ExtractJwt.fromAuthHeaderAsBearerToken()
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      
      ignoreExpiration: false,
      
      // TODO 2: Cung cấp con dấu mộc đỏ để bác bảo vệ đối chiếu.
      // Gợi ý: Điền lại đúng chuỗi bí mật ('CHIA_KHOA') mà bạn đã dùng ở JwtModule
      secretOrKey: 'CHIA_KHOA', 
    });
  }

  // Hàm validate này sẽ TỰ ĐỘNG chạy nếu token hợp lệ (không bị hết hạn, đúng chữ ký)
  async validate(payload: any) {
    // TODO 3: Trả về một object chứa thông tin user lấy từ payload. 
    // Gợi ý: return { username: payload.username, role: payload.role };
    // NestJS sẽ tự động nhét kết quả này vào biến `request.user` cho bạn xài ở Controller.
    return {
        username: payload.username,
        role : payload.role
    }
    
  }
}
// import {
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';

// import {
//   PassportStrategy,
// } from '@nestjs/passport';

// import {
//   ExtractJwt,
//   Strategy,
// } from 'passport-jwt';

// import { ConfigService } from '@nestjs/config';

// import { AuthService } from '../auth.service';

// import { JwtPayload } from '../interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy
//   extends PassportStrategy(Strategy)
// {
//   constructor(
//     private readonly configService:
//       ConfigService,

//     private readonly authService:
//       AuthService,
//   ) {
//     super({
//       jwtFromRequest:
//         ExtractJwt.fromAuthHeaderAsBearerToken(),

//       ignoreExpiration: false,

//       secretOrKey:
//         configService.get<string>(
//           'JWT_SECRET',
//         ),
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user =
//       await this.authService.validateUser(
//         payload.sub,
//       );

//     if (!user) {
//       throw new UnauthorizedException({
//         success: false,
//         error: {
//           code: 'UNAUTHORIZED',
//           message: 'Invalid authentication token',
//         },
//       });
//     }

//     return {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       organizationId:
//         user.organizationId,
//     };
//   }
// }

// import {
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import {
//   ExtractJwt,
//   Strategy,
// } from 'passport-jwt';
// import { AuthService } from '../auth.service';
// import { JwtPayload } from '../interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly authService: AuthService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.authService.validateUser(payload.sub);

//     if (!user) {
//       throw new UnauthorizedException({
//         success: false,
//         error: {
//           code: 'UNAUTHORIZED',
//           message: 'Invalid authentication token',
//         },
//       });
//     }

//     return {
//       id: user.id,
//       email: user.email,
//       name: user.name,
//       role: user.role,
//       organizationId: user.organizationId,
//     };
//   }
// }

import {
  Injectable,
} from '@nestjs/common';

import {
  PassportStrategy,
} from '@nestjs/passport';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import { ConfigService } from '@nestjs/config';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
{
  constructor(
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_SECRET',
        ),
    });
  }

  async validate(
    payload: JwtPayload,
  ) {
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId:
        payload.organizationId,
      role: payload.role,
    };
  }
}
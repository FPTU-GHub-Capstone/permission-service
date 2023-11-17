import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '../users';

import { FirebaseAuthStrategy } from './FirebaseAuthStrategy';
import { FirebaseAuthGuard } from './FirebaseAuthGuard';
import { AuthService } from './AuthService';
import { Types as TAuth } from './types';
import { JwtFactory } from './JwtFactory';
import { JwtAuthGuard } from './JwtAuthGuard';


export * from './FirebaseAuthGuard';
export * from './JwtAuthGuard';
export * from './JwtFactory';
export * from './types';

@Module({
	imports: [
		JwtModule.registerAsync({
			useClass: JwtFactory,
			global: true,
		}),
		UserModule,
	],
	providers: [
		FirebaseAuthStrategy,
		FirebaseAuthGuard,
		JwtAuthGuard,
		{
			provide: TAuth.AUTH_SVC,
			useClass: AuthService,
		},
	],
	exports: [TAuth.AUTH_SVC],
})
export class AuthenticationModule {};

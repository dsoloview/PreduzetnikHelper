import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {PrismaModule} from "./prisma/prisma.module";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {ConfigModule} from "@nestjs/config";
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, UsersModule, ClientsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScriptsModule } from './scripts/scripts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScriptsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

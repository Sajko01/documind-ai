// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { OrganizationsModule } from './organizations/organizations.module';
// import { DocumentsModule } from './documents/documents.module';
// import { ChatModule } from './chat/chat.module';
// import { ProductsModule } from './products/products.module';
// import { OffersModule } from './offers/offers.module';
// import { AnalyticsModule } from './analytics/analytics.module';

// @Module({
//   imports: [AuthModule, UsersModule, OrganizationsModule, DocumentsModule, ChatModule, ProductsModule, OffersModule, AnalyticsModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { ProductsModule } from './products/products.module';
import { OffersModule } from './offers/offers.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthModule,
    UsersModule,
    OrganizationsModule,
    DocumentsModule,
    ChatModule,
    ProductsModule,
    OffersModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
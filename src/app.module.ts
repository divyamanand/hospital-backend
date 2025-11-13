import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { PatientModule } from './modules/patient/patient.module';
import { StaffModule } from './modules/staff/staff.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { PrescriptionModule } from './modules/prescription/prescription.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { RoomModule } from './modules/room/room.module';
import { AuthModule } from './modules/auth/auth.module';
import { SpecialtyModule } from './modules/specialty/specialty.module';
import { IssueModule } from './modules/issue/issue.module';
import { RequirementModule } from './modules/requirement/requirement.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'postgres',
          entities: [join(__dirname, '/entities/*{.ts,.js}')],
          synchronize: true,
        } as any;
      },
    }),
    PatientModule,
    StaffModule,
    AppointmentModule,
    PrescriptionModule,
    InventoryModule,
    RoomModule,
    AuthModule,
    SpecialtyModule,
    IssueModule,
    RequirementModule,
  ],
})
export class AppModule {}

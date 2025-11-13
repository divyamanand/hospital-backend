import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requirement } from '../../entities/requirement.entity';
import { RequirementFulfillment } from '../../entities/requirement-fulfillment.entity';
import { RequirementController } from './requirement.controller';
import { RequirementService } from './requirement.service';

@Module({
  imports: [TypeOrmModule.forFeature([Requirement, RequirementFulfillment])],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}

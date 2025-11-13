import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requirement } from '../../entities/requirement.entity';
import { RequirementFulfillment } from '../../entities/requirement-fulfillment.entity';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(Requirement) private reqRepo: Repository<Requirement>,
    @InjectRepository(RequirementFulfillment) private fulRepo: Repository<RequirementFulfillment>,
  ) {}

  create(data: Partial<Requirement>) { return this.reqRepo.save(this.reqRepo.create(data)); }
  findByAppointment(appointmentId: string) { return this.reqRepo.find({ where: { appointment: { id: appointmentId } as any } }); }
  async fulfill(id: string, body: Partial<RequirementFulfillment>) {
    const fulfillment = await this.fulRepo.save(this.fulRepo.create({ ...body, requirement: { id } as any }));
    await this.reqRepo.update({ id }, { status: 'fulfilled' as any });
    return fulfillment;
  }
}

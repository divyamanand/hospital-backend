import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(@InjectRepository(Appointment) private repo: Repository<Appointment>) {}
  create(data: Partial<Appointment>) { return this.repo.save(this.repo.create(data)); }
  findAll() { return this.repo.find({ relations: ['patient', 'doctor'] }); }
  findOne(id: string) { return this.repo.findOne({ where: { id }, relations: ['patient','doctor'] }); }
}

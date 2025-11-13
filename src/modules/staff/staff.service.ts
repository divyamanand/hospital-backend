import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from '../../entities/staff.entity';

@Injectable()
export class StaffService {
  constructor(@InjectRepository(Staff) private repo: Repository<Staff>) {}
  create(data: Partial<Staff>) { return this.repo.save(this.repo.create(data)); }
  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
}

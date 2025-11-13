import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Specialty } from '../../entities/specialty.entity';

@Injectable()
export class SpecialtyService {
  constructor(@InjectRepository(Specialty) private repo: Repository<Specialty>) {}
  findAll() { return this.repo.find(); }
}

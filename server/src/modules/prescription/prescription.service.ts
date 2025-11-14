import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../../entities/prescription.entity';
import { PrescriptionItem } from '../../entities/prescription-item.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription) private presRepo: Repository<Prescription>,
    @InjectRepository(PrescriptionItem) private itemRepo: Repository<PrescriptionItem>,
    @InjectRepository(InventoryItem) private invRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction) private txnRepo: Repository<InventoryTransaction>,
  ) {}

  create(data: Partial<Prescription>) { return this.presRepo.save(this.presRepo.create(data)); }
  findAll(filter?: any) {
    const qb = this.presRepo.createQueryBuilder('p').leftJoinAndSelect('p.patient','patient').leftJoinAndSelect('p.doctor','doctor').leftJoinAndSelect('p.items','items');
    qb.where('1=1');
    if (filter?.patientId) qb.andWhere('p.patientId = :pid', { pid: filter.patientId });
    if (filter?.doctorId) qb.andWhere('p.doctorId = :did', { did: filter.doctorId });
    if (filter?.from) qb.andWhere('p.createdAt >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('p.createdAt <= :to', { to: filter.to });
    return qb.getMany();
  }
  async update(id: string, data: Partial<Prescription>) { await this.presRepo.update({ id }, data); return this.presRepo.findOne({ where: { id }, relations: ['items','patient','doctor'] }); }

  async dispense(id: string) {
    // Dispense simply returns prescription; actual item stock adjustments handled elsewhere
    return this.presRepo.findOne({ where: { id }, relations: ['items','patient','doctor'] });
  }

  // Role-specific filtered lists
  async findAllForDoctor(doctorId: string, filter?: any) { return this.findAll({ ...filter, doctorId }); }
  async findAllForPatient(patientId: string, filter?: any) { return this.findAll({ ...filter, patientId }); }
  async findAllForDispense(filter?: any) { return this.findAll(filter); }
  async isDoctorOwner(prescriptionId: string, doctorStaffId: string) {
    const row = await this.presRepo.findOne({ where: { id: prescriptionId }, relations: ['doctor'] });
    return !!row && (row.doctor as any)?.id === doctorStaffId;
  }
}

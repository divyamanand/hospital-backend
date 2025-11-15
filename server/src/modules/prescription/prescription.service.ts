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

  async create(data: any) {
    const items = Array.isArray(data?.items) ? data.items : null;
    const payload: any = { ...data };
    delete payload.items;
    if (payload.patientId && !payload.patient) payload.patient = { id: payload.patientId } as any;
    if (payload.doctorId && !payload.doctor) payload.doctor = { id: payload.doctorId } as any;
    const pres = await this.presRepo.save(this.presRepo.create(payload));
    if (items && items.length) {
      const now = new Date();
      const toSave = items.map((it: any) => this.itemRepo.create({
        prescription: { id: pres.id } as any,
        name: it.name,
        dosage: it.dosage,
        duration: it.duration,
        quantity: it.quantity,
        dayDivide: it.dayDivide ?? null,
        method: it.method ?? null,
        createdAt: now,
        updatedAt: now,
      }));
      await this.itemRepo.save(toSave);
    }
    return this.findOne(pres.id);
  }
  findOne(id: string) {
    return this.presRepo.findOne({ where: { id }, relations: ['items','patient','patient.user','doctor','doctor.user'] });
  }
  async createForDoctor(data: any, doctorStaffId: string) {
    const payload: Partial<Prescription> = { ...data };
    if (doctorStaffId) (payload as any).doctor = { id: doctorStaffId } as any;
    if ((data as any)?.patientId) (payload as any).patient = { id: (data as any).patientId } as any;
    return this.create(payload);
  }
  findAll(filter?: any) {
    const qb = this.presRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.patient','patient')
      .leftJoinAndSelect('patient.user','puser')
      .leftJoinAndSelect('p.doctor','doctor')
      .leftJoinAndSelect('doctor.user','duser')
      .leftJoinAndSelect('p.items','items');
    qb.where('1=1');
    if (filter?.patientId) qb.andWhere('p.patientId = :pid', { pid: filter.patientId });
    if (filter?.doctorId) qb.andWhere('p.doctorId = :did', { did: filter.doctorId });
    if (filter?.from) qb.andWhere('p.createdAt >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('p.createdAt <= :to', { to: filter.to });
    return qb.getMany();
  }
  async update(id: string, data: any) {
    const items = Array.isArray(data?.items) ? data.items : null;
    const payload: any = { ...data };
    delete payload.items;
    await this.presRepo.update({ id }, payload);
    if (items) {
      // replace items set
      await this.itemRepo.createQueryBuilder().delete().where('"prescriptionId" = :pid', { pid: id }).execute();
      if (items.length) {
        const now = new Date();
        const toSave = items.map((it: any) => this.itemRepo.create({
          prescription: { id } as any,
          name: it.name,
          dosage: it.dosage,
          duration: it.duration,
          quantity: it.quantity,
          dayDivide: it.dayDivide ?? null,
          method: it.method ?? null,
          createdAt: now,
          updatedAt: now,
        }));
        await this.itemRepo.save(toSave);
      }
    }
    return this.findOne(id);
  }

  async dispense(id: string) {
    return this.presRepo.findOne({ where: { id }, relations: ['items','patient','patient.user','doctor','doctor.user'] });
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from '../../entities/room.entity';
import { Patient } from '../../entities/patient.entity';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) private repo: Repository<Room>) {}
  findAll(filter?: any) {
    const qb = this.repo.createQueryBuilder('r');
    qb.where('1=1');
    if (filter?.status) qb.andWhere('r.status = :st', { st: filter.status });
    if (filter?.type) qb.andWhere('r.type = :tp', { tp: filter.type });
    if (filter?.capacityMin) qb.andWhere('(r.capacity IS NOT NULL AND r.capacity >= :cmin)', { cmin: filter.capacityMin });
    if (filter?.capacityMax) qb.andWhere('(r.capacity IS NOT NULL AND r.capacity <= :cmax)', { cmax: filter.capacityMax });
    if (filter?.patientId) qb.andWhere('r.currentPatientId = :pid', { pid: filter.patientId });
    if (filter?.available) qb.andWhere('r.status = :av', { av: RoomStatus.Available });
    return qb.getMany();
  }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(data: Partial<Room>) { const payload = this.normalizeRoomData(data as any); return this.repo.save(this.repo.create(payload)); }
  async update(id: string, data: Partial<Room>) { const payload = this.normalizeRoomData(data as any); await this.repo.update({ id }, payload); return this.repo.findOne({ where: { id } }); }
  async remove(id: string) { await this.repo.delete({ id }); return { id, removed: true } as any; }
  async book(id: string, body: { appointmentId: string; start: string; end: string }) {
    // Simplified: mark room reserved
    await this.repo.update({ id }, { status: RoomStatus.Reserved });
    return this.repo.findOne({ where: { id } });
  }

  async assign(id: string, body: { patientId: string }) {
    const room = await this.repo.findOne({ where: { id } });
    if (!room) return null;
    await this.repo.update({ id }, { status: RoomStatus.Occupied, currentPatient: { id: body.patientId } as any });
    return this.repo.findOne({ where: { id } });
  }

  async changeStatus(id: string, status: Room['status']) {
    if (!Object.values(RoomStatus).includes(status as any)) throw new Error('Invalid status');
    await this.repo.update({ id }, { status });
    return this.repo.findOne({ where: { id } });
  }

  findAvailable(type?: Room['type']) {
    const qb = this.repo.createQueryBuilder('r').where('r.status = :st', { st: 'available' });
    if (type) qb.andWhere('r.type = :tp', { tp: type });
    return qb.getMany();
  }

  private normalizeRoomData(data: any): Partial<Room> {
    const out: any = { ...data };
    if (data && typeof data === 'object') {
      if (data.room_number && !out.roomNumber) out.roomNumber = data.room_number;
      if (data.current_patient_id && !out.currentPatientId) out.currentPatientId = data.current_patient_id;
    }
    return out;
  }
}

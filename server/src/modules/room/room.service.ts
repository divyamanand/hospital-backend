import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/room.entity';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) private repo: Repository<Room>) {}
  findAll() { return this.repo.find(); }
  findOne(id: string) { return this.repo.findOne({ where: { id } }); }
  create(data: Partial<Room>) { const payload = this.normalizeRoomData(data as any); return this.repo.save(this.repo.create(payload)); }
  async update(id: string, data: Partial<Room>) { const payload = this.normalizeRoomData(data as any); await this.repo.update({ id }, payload); return this.repo.findOne({ where: { id } }); }
  async remove(id: string) { await this.repo.delete({ id }); return { id, removed: true } as any; }
  async book(id: string, body: { appointmentId: string; start: string; end: string }) {
    // Placeholder: mark status reserved and set current reference
    await this.repo.update({ id }, { status: 'reserved' as any });
    return this.repo.findOne({ where: { id } });
  }

  async changeStatus(id: string, status: Room['status']) {
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/room.entity';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) private repo: Repository<Room>) {}
  findAll() { return this.repo.find(); }
  create(data: Partial<Room>) { return this.repo.save(this.repo.create(data)); }
  async update(id: string, data: Partial<Room>) { await this.repo.update({ id }, data); return this.repo.findOne({ where: { id } }); }
  async book(id: string, body: { appointmentId: string; start: string; end: string }) {
    // Placeholder: mark status reserved and set current reference
    await this.repo.update({ id }, { status: 'reserved' as any });
    return this.repo.findOne({ where: { id } });
  }
}

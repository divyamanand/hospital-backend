import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../../entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(@InjectRepository(Activity) private repo: Repository<Activity>) {}

  async log(userId: string | null, action: string, ip?: string | null, meta?: any) {
    const entry = this.repo.create({ userId: userId ?? null, action, ip: ip ?? null, meta: meta ?? null });
    return this.repo.save(entry);
  }

  async list(filter?: any) {
    const qb = this.repo.createQueryBuilder('a');
    if (filter?.userId) qb.andWhere('a.userId = :uid', { uid: filter.userId });
    if (filter?.action) qb.andWhere('a.action ILIKE :act', { act: `%${filter.action}%` });
    qb.orderBy('a.createdAt', 'DESC');
    if (filter?.limit) qb.limit(filter.limit);
    return qb.getMany();
  }
}

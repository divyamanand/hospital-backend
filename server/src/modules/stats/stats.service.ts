import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../../entities/appointment.entity';
import { Invitation } from '../../entities/invitation.entity';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryTransaction } from '../../entities/inventory-transaction.entity';
import { Room, RoomStatus } from '../../entities/room.entity';
import { Leave } from '../../entities/leave.entity';
import { Activity } from '../../entities/activity.entity';
import { ItemRequirement } from '../../entities/item-requirement.entity';
import { StaffRequirement } from '../../entities/staff-requirement.entity';
import { RoomRequirement } from '../../entities/room-requirement.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Invitation) private inviteRepo: Repository<Invitation>,
    @InjectRepository(InventoryItem) private itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction) private txnRepo: Repository<InventoryTransaction>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(Activity) private actRepo: Repository<Activity>,
    @InjectRepository(ItemRequirement) private itemReqRepo: Repository<ItemRequirement>,
    @InjectRepository(StaffRequirement) private staffReqRepo: Repository<StaffRequirement>,
    @InjectRepository(RoomRequirement) private roomReqRepo: Repository<RoomRequirement>,
  ) {}

  private todayRange() {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(start); end.setDate(start.getDate()+1);
    return { start, end };
  }

  async todaysAppointments() {
    const { start, end } = this.todayRange();
    return this.apptRepo.createQueryBuilder('a')
      .where('a.startAt >= :start AND a.startAt < :end', { start, end })
      .orderBy('a.startAt','ASC')
      .getMany();
  }

  async pendingInvitations() {
    const now = new Date();
    return this.inviteRepo.createQueryBuilder('i')
      .where('i.claimedAt IS NULL')
      .andWhere('i.expiresAt > :now', { now })
      .orderBy('i.createdAt','DESC')
      .getMany();
  }

  async lowStockItems(threshold: number = 10) {
    return this.itemRepo.createQueryBuilder('it')
      .where('(it.quantity IS NULL OR it.quantity < :th)', { th: threshold })
      .orderBy('it.quantity','ASC')
      .getMany();
  }

  async occupiedRooms() {
    return this.roomRepo.find({ where: { status: RoomStatus.Occupied } as any });
  }

  async staffOnLeaveToday() {
    const today = new Date().toISOString().slice(0,10);
    return this.leaveRepo.createQueryBuilder('l')
      .where('l.status = :st', { st: 'approved' })
      .andWhere(':today BETWEEN l.startDate AND l.endDate', { today })
      .getMany();
  }

  async appointmentsLast7Days() {
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate()-6); start.setHours(0,0,0,0);
    const rows = await this.apptRepo.createQueryBuilder('a')
      .select('DATE(a.startAt)','day')
      .addSelect('COUNT(*)','count')
      .where('a.startAt >= :start AND a.startAt <= :end', { start, end })
      .groupBy('DATE(a.startAt)')
      .orderBy('day','ASC')
      .getRawMany();
    return rows;
  }

  async inventorySummary() {
    const items = await this.itemRepo.count();
    const stockRow = await this.itemRepo.createQueryBuilder('i').select('SUM(i.quantity)','total').getRawOne();
    const totalStock = parseInt(stockRow?.total || '0',10);
    const soonDate = new Date(); soonDate.setDate(soonDate.getDate()+30); const soonStr = soonDate.toISOString().slice(0,10);
    const expiringSoon = await this.itemRepo.createQueryBuilder('i')
      .where('i.expiry IS NOT NULL AND i.expiry < :soon', { soon: soonStr })
      .getCount();
    const demand = await this.txnRepo.query(
      `SELECT inventoryItemId, SUM(quantity) as sum_out
       FROM inventory_transaction
       WHERE type='out' AND createdAt >= (NOW() - INTERVAL '30 days')
       GROUP BY inventoryItemId
       ORDER BY sum_out DESC
       LIMIT 5`
    );
    return { items, totalStock, expiringSoon, mostInDemand: demand };
  }

  async recentActivities(limit: number = 20) {
    return this.actRepo.createQueryBuilder('a')
      .orderBy('a.createdAt','DESC')
      .limit(limit)
      .getMany();
  }

  async requirementsSnapshot() {
    const item = await this.statusCounts(this.itemReqRepo,'item');
    const staff = await this.statusCounts(this.staffReqRepo,'staff');
    const room = await this.statusCounts(this.roomReqRepo,'room');
    return { item, staff, room };
  }

  private async statusCounts(repo: Repository<any>, label: string) {
    const rows = await repo.createQueryBuilder('r')
      .select('r.status','status')
      .addSelect('COUNT(*)','count')
      .groupBy('r.status')
      .getRawMany();
    return rows.reduce((acc: any, r: any) => { acc[r.status] = parseInt(r.count,10); return acc; }, {});
  }

  async overview() {
    const [todaysAppointments, pendingInvitations, lowStock, occupiedRooms, staffOnLeave, appt7, invSummary, recentActs, reqSnap] = await Promise.all([
      this.todaysAppointments(),
      this.pendingInvitations(),
      this.lowStockItems(),
      this.occupiedRooms(),
      this.staffOnLeaveToday(),
      this.appointmentsLast7Days(),
      this.inventorySummary(),
      this.recentActivities(),
      this.requirementsSnapshot(),
    ]);
    return {
      todaysAppointments,
      pendingInvitations,
      lowStockItems: lowStock,
      occupiedRooms,
      staffOnLeave: staffOnLeave,
      appointmentsLast7Days: appt7,
      inventory: invSummary,
      recentActivities: recentActs,
      requirements: reqSnap,
    };
  }
}

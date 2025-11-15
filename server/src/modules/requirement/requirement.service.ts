import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemRequirement, RequirementStatus } from '../../entities/item-requirement.entity';
import { ItemRequirementFulfillment } from '../../entities/item-requirement-fulfillment.entity';
import { StaffRequirement } from '../../entities/staff-requirement.entity';
import { StaffRequirementFulfillment } from '../../entities/staff-requirement-fulfillment.entity';
import { RoomRequirement } from '../../entities/room-requirement.entity';
import { RoomRequirementFulfillment } from '../../entities/room-requirement-fulfillment.entity';

@Injectable()
export class RequirementService {
  constructor(
    @InjectRepository(ItemRequirement) private readonly itemReqRepo: Repository<ItemRequirement>,
    @InjectRepository(ItemRequirementFulfillment) private readonly itemFulfillRepo: Repository<ItemRequirementFulfillment>,
    @InjectRepository(StaffRequirement) private readonly staffReqRepo: Repository<StaffRequirement>,
    @InjectRepository(StaffRequirementFulfillment) private readonly staffFulfillRepo: Repository<StaffRequirementFulfillment>,
    @InjectRepository(RoomRequirement) private readonly roomReqRepo: Repository<RoomRequirement>,
    @InjectRepository(RoomRequirementFulfillment) private readonly roomFulfillRepo: Repository<RoomRequirementFulfillment>,
  ) {}

  // Item Requirements
  listItemRequirements() { return this.itemReqRepo.find({ order: { createdAt: 'DESC' } }); }
  async getItemRequirement(id: string) {
    const r = await this.itemReqRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Item requirement not found');
    return r;
  }
  createItemRequirement(body: Partial<ItemRequirement>) {
    const r = this.itemReqRepo.create({
      primaryUserId: body.primaryUserId!,
      kind: body.kind as any,
      quantity: body.quantity!,
      notes: body.notes ?? null,
      status: RequirementStatus.Open,
    });
    return this.itemReqRepo.save(r);
  }
  async updateItemRequirement(id: string, body: Partial<ItemRequirement>) {
    const r = await this.getItemRequirement(id);
    if (typeof body.status !== 'undefined') r.status = body.status;
    if (typeof body.notes !== 'undefined') r.notes = body.notes ?? null;
    if (typeof body.quantity !== 'undefined') r.quantity = body.quantity!;
    return this.itemReqRepo.save(r);
  }
  async listItemFulfillments(requirementId: string) {
    await this.getItemRequirement(requirementId);
    return this.itemFulfillRepo.find({ where: { requirement: { id: requirementId } as any }, order: { createdAt: 'ASC' } });
  }
  async createItemFulfillment(requirementId: string, body: { inventoryItemId: string; quantity: number; startAt?: string | null; endAt?: string | null; }) {
    const req = await this.getItemRequirement(requirementId);
    if (req.status === RequirementStatus.Open) {
      req.status = RequirementStatus.InProgress;
      await this.itemReqRepo.save(req);
    }
    const f = this.itemFulfillRepo.create({
      requirement: { id: requirementId } as any,
      inventoryItem: { id: body.inventoryItemId } as any,
      quantity: body.quantity,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
    });
    const saved = await this.itemFulfillRepo.save(f);
    await this.recomputeItemRequirementStatus(requirementId);
    return saved;
  }
  async updateItemFulfillment(fulfillmentId: string, body: { startAt?: string | null; endAt?: string | null; quantity?: number }) {
    const f = await this.itemFulfillRepo.findOne({ where: { id: fulfillmentId }, relations: { requirement: true } });
    if (!f) throw new NotFoundException('Item fulfillment not found');
    if (typeof body.startAt !== 'undefined') f.startAt = body.startAt ? new Date(body.startAt) : null;
    if (typeof body.endAt !== 'undefined') f.endAt = body.endAt ? new Date(body.endAt) : null;
    if (typeof body.quantity !== 'undefined') f.quantity = body.quantity!;
    const saved = await this.itemFulfillRepo.save(f);
    await this.recomputeItemRequirementStatus(f.requirement.id);
    return saved;
  }
  private async recomputeItemRequirementStatus(requirementId: string) {
    const req = await this.getItemRequirement(requirementId);
    const raw = await this.itemFulfillRepo.createQueryBuilder('f')
      .select('COALESCE(SUM(f.quantity),0)', 'sum')
      .where('f.requirementId = :id', { id: requirementId })
      .getRawOne<{ sum: string }>();
    const total = parseInt((raw?.sum ?? '0'), 10);
    if (total >= req.quantity && req.status !== RequirementStatus.Fulfilled) {
      req.status = RequirementStatus.Fulfilled;
      await this.itemReqRepo.save(req);
    } else if (total > 0 && req.status === RequirementStatus.Open) {
      req.status = RequirementStatus.InProgress;
      await this.itemReqRepo.save(req);
    }
  }

  // Staff Requirements
  listStaffRequirements() { return this.staffReqRepo.find({ order: { createdAt: 'DESC' } }); }
  async getStaffRequirement(id: string) {
    const r = await this.staffReqRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Staff requirement not found');
    return r;
  }
  createStaffRequirement(body: Partial<StaffRequirement>) {
    const r = this.staffReqRepo.create({
      primaryUserId: body.primaryUserId!,
      roleNeeded: body.roleNeeded!,
      quantity: body.quantity!,
      notes: body.notes ?? null,
      status: RequirementStatus.Open,
    });
    return this.staffReqRepo.save(r);
  }
  async updateStaffRequirement(id: string, body: Partial<StaffRequirement>) {
    const r = await this.getStaffRequirement(id);
    if (typeof body.status !== 'undefined') r.status = body.status;
    if (typeof body.notes !== 'undefined') r.notes = body.notes ?? null;
    if (typeof body.quantity !== 'undefined') r.quantity = body.quantity!;
    if (typeof body.roleNeeded !== 'undefined') r.roleNeeded = body.roleNeeded!;
    return this.staffReqRepo.save(r);
  }
  async listStaffFulfillments(requirementId: string) {
    await this.getStaffRequirement(requirementId);
    return this.staffFulfillRepo.find({ where: { requirement: { id: requirementId } as any }, order: { createdAt: 'ASC' } });
  }
  async createStaffFulfillment(requirementId: string, body: { staffId: string; startAt?: string | null; endAt?: string | null; }) {
    const req = await this.getStaffRequirement(requirementId);
    if (req.status === RequirementStatus.Open) {
      req.status = RequirementStatus.InProgress;
      await this.staffReqRepo.save(req);
    }
    const f = this.staffFulfillRepo.create({
      requirement: { id: requirementId } as any,
      staff: { id: body.staffId } as any,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
    });
    const saved = await this.staffFulfillRepo.save(f);
    await this.recomputeStaffRequirementStatus(requirementId);
    return saved;
  }
  async updateStaffFulfillment(fulfillmentId: string, body: { startAt?: string | null; endAt?: string | null; }) {
    const f = await this.staffFulfillRepo.findOne({ where: { id: fulfillmentId }, relations: { requirement: true } });
    if (!f) throw new NotFoundException('Staff fulfillment not found');
    if (typeof body.startAt !== 'undefined') f.startAt = body.startAt ? new Date(body.startAt) : null;
    if (typeof body.endAt !== 'undefined') f.endAt = body.endAt ? new Date(body.endAt) : null;
    const saved = await this.staffFulfillRepo.save(f);
    await this.recomputeStaffRequirementStatus(f.requirement.id);
    return saved;
  }
  private async recomputeStaffRequirementStatus(requirementId: string) {
    const req = await this.getStaffRequirement(requirementId);
    const total = await this.staffFulfillRepo.count({ where: { requirement: { id: requirementId } as any } });
    if (total >= req.quantity && req.status !== RequirementStatus.Fulfilled) {
      req.status = RequirementStatus.Fulfilled;
      await this.staffReqRepo.save(req);
    } else if (total > 0 && req.status === RequirementStatus.Open) {
      req.status = RequirementStatus.InProgress;
      await this.staffReqRepo.save(req);
    }
  }

  // Room Requirements
  listRoomRequirements() { return this.roomReqRepo.find({ order: { createdAt: 'DESC' } }); }
  async getRoomRequirement(id: string) {
    const r = await this.roomReqRepo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Room requirement not found');
    return r;
    }
  createRoomRequirement(body: Partial<RoomRequirement>) {
    const r = this.roomReqRepo.create({
      primaryUserId: body.primaryUserId!,
      roomType: body.roomType!,
      quantity: body.quantity!,
      notes: body.notes ?? null,
      status: RequirementStatus.Open,
    });
    return this.roomReqRepo.save(r);
  }
  async updateRoomRequirement(id: string, body: Partial<RoomRequirement>) {
    const r = await this.getRoomRequirement(id);
    if (typeof body.status !== 'undefined') r.status = body.status;
    if (typeof body.notes !== 'undefined') r.notes = body.notes ?? null;
    if (typeof body.quantity !== 'undefined') r.quantity = body.quantity!;
    if (typeof body.roomType !== 'undefined') r.roomType = body.roomType!;
    return this.roomReqRepo.save(r);
  }
  async listRoomFulfillments(requirementId: string) {
    await this.getRoomRequirement(requirementId);
    return this.roomFulfillRepo.find({ where: { requirement: { id: requirementId } as any }, order: { createdAt: 'ASC' } });
  }
  async createRoomFulfillment(requirementId: string, body: { roomId: string; startAt?: string | null; endAt?: string | null; }) {
    const req = await this.getRoomRequirement(requirementId);
    if (req.status === RequirementStatus.Open) {
      req.status = RequirementStatus.InProgress;
      await this.roomReqRepo.save(req);
    }
    const f = this.roomFulfillRepo.create({
      requirement: { id: requirementId } as any,
      room: { id: body.roomId } as any,
      startAt: body.startAt ? new Date(body.startAt) : null,
      endAt: body.endAt ? new Date(body.endAt) : null,
    });
    const saved = await this.roomFulfillRepo.save(f);
    await this.recomputeRoomRequirementStatus(requirementId);
    return saved;
  }
  async updateRoomFulfillment(fulfillmentId: string, body: { startAt?: string | null; endAt?: string | null; }) {
    const f = await this.roomFulfillRepo.findOne({ where: { id: fulfillmentId }, relations: { requirement: true } });
    if (!f) throw new NotFoundException('Room fulfillment not found');
    if (typeof body.startAt !== 'undefined') f.startAt = body.startAt ? new Date(body.startAt) : null;
    if (typeof body.endAt !== 'undefined') f.endAt = body.endAt ? new Date(body.endAt) : null;
    const saved = await this.roomFulfillRepo.save(f);
    await this.recomputeRoomRequirementStatus(f.requirement.id);
    return saved;
  }
  private async recomputeRoomRequirementStatus(requirementId: string) {
    const req = await this.getRoomRequirement(requirementId);
    const total = await this.roomFulfillRepo.count({ where: { requirement: { id: requirementId } as any } });
    if (total >= req.quantity && req.status !== RequirementStatus.Fulfilled) {
      req.status = RequirementStatus.Fulfilled;
      await this.roomReqRepo.save(req);
    } else if (total > 0 && req.status === RequirementStatus.Open) {
      req.status = RequirementStatus.InProgress;
      await this.roomReqRepo.save(req);
    }
  }
}

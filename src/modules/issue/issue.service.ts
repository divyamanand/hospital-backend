import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../../entities/issue.entity';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue) private issueRepo: Repository<Issue>,
  ) {}

  create(data: Partial<Issue>) { return this.issueRepo.save(this.issueRepo.create(data)); }
  findAll() { return this.issueRepo.find({ relations: ['mappedSpecialty'] }); }

  async getMappedDoctors(issueId: string) {
    // selects doctors by mapped specialty; returns doctor ids
    const issue = await this.issueRepo.findOne({ where: { id: issueId }, relations: ['mappedSpecialty'] });
    if (!issue?.mappedSpecialty) return [];
    // staff_specialty table join
    const rows = await this.issueRepo.query(
      `SELECT ss.staff_id as "staffId" FROM staff_specialty ss WHERE ss.specialty_id = $1`,
      [issue.mappedSpecialty.id],
    );
    return rows.map((r: any) => r.staffId);
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IssueService } from './issue.service';

@Controller('issues')
export class IssueController {
  constructor(private readonly svc: IssueService) {}

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Get()
  list() { return this.svc.findAll(); }

  @Get(':id/mapped-doctors')
  mappedDoctors(@Param('id') id: string) { return this.svc.getMappedDoctors(id); }
}

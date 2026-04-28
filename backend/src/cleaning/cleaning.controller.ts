import { Controller, Get, Post, Body, Req, UseGuards, Delete, Param, Patch } from '@nestjs/common';
import { CleaningService } from './cleaning.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('cleaning')
@UseGuards(SupabaseGuard)
export class CleaningController {
  constructor(private readonly cleaningService: CleaningService) {}

  private getHouseholdId(req: any): string {
    return req.headers['x-household-id'];
  }

  @Get('plan')
  async getWeeklyPlan(@Req() req) {
    return this.cleaningService.getWeeklyPlan(this.getHouseholdId(req));
  }

  @Post('task')
  async createTask(@Req() req, @Body() data: { title: string, description: any[] }) {
    return this.cleaningService.createTask(this.getHouseholdId(req), data);
  }

  @Post('toggle')
  async toggleTask(@Req() req, @Body() data: { taskId: string, isDone: boolean }) {
    return this.cleaningService.toggleTaskStatus(req.user.id, data);
  }

  @Patch('update-content/:id') // <--- Diese Route muss existieren
  async updateTask(@Param('id') id: string, @Body() data: { title?: string, description: any[] }) {
    console.log('Patch erhalten für ID:', id); // Zum Testen in der Konsole
    return this.cleaningService.updateTask(id, data);
  }

  @Delete('task/:id')
  async deleteTask(@Param('id') id: string) {
    return this.cleaningService.deleteTask(id);
  }
}
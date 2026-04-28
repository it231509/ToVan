import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CleaningService {
  constructor(private readonly supabase: SupabaseService) {}

  private getCurrentWeekData() {
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    return {
      week: Math.ceil((now.getDay() + 1 + numberOfDays) / 7),
      year: now.getFullYear()
    };
  }

  async getWeeklyPlan(householdId: string) {
    const { week, year } = this.getCurrentWeekData();

    const { data: tasks, error: tErr } = await this.supabase.client
      .from('cleaning_tasks')
      .select('*')
      .eq('household_id', householdId)
      .order('sort_order', { ascending: true });

    if (tErr) throw new BadRequestException(tErr.message);

    const { data: logs } = await this.supabase.client
      .from('cleaning_logs')
      .select('task_id, is_done')
      .eq('week_number', week)
      .eq('year', year);

    return tasks.map(task => ({
      ...task,
      // Sicherstellen, dass description immer als Array zurückkommt (falls leer in DB)
      description: task.description || [],
      is_done: logs?.find(l => l.task_id === task.id)?.is_done || false
    }));
  }

  async createTask(householdId: string, data: any) {
    // data.description enthält jetzt das Array der Unteraufgaben
    const { error } = await this.supabase.client
      .from('cleaning_tasks')
      .insert([{ ...data, household_id: householdId }]);
    
    if (error) throw new BadRequestException(error.message);
    return { status: 'success' };
  }

  async toggleTaskStatus(userId: string, data: { taskId: string, isDone: boolean }) {
    const { week, year } = this.getCurrentWeekData();
    const { error } = await this.supabase.client
      .from('cleaning_logs')
      .upsert({
        task_id: data.taskId,
        week_number: week,
        year: year,
        is_done: data.isDone,
        done_by: userId,
        updated_at: new Date()
      }, { onConflict: 'task_id, week_number, year' });

    if (error) throw new BadRequestException(error.message);
    return { status: 'success' };
  }

  async updateTask(id: string, data: any) {
  const { error } = await this.supabase.client
    .from('cleaning_tasks')
    .update({ 
      title: data.title, 
      description: data.description 
    })
    .eq('id', id);

  if (error) throw new BadRequestException(error.message);
  return { status: 'success' };
}

  async deleteTask(id: string) {
    await this.supabase.client.from('cleaning_tasks').delete().eq('id', id);
    return { status: 'success' };
  }
}
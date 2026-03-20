import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  private getHouseholdId(req: any): string {
    const id = req.headers['x-household-id'];
    if (!id) {
      throw new BadRequestException('Keine Haushalts-ID im Header (x-household-id) gefunden.');
    }
    return id;
  }

  @Get()
  @UseGuards(SupabaseGuard)
  getRange(
    @Req() req,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    const householdId = this.getHouseholdId(req);
    return this.mealPlanService.getPlanForRange(req.user.id, householdId, start, end);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  add(@Req() req, @Body() body: any) {
    const householdId = this.getHouseholdId(req);
    return this.mealPlanService.addMeal(req.user.id, householdId, body);
  }

  @Put(':id')
  @UseGuards(SupabaseGuard)
  update(@Req() req, @Param('id') id: string, @Body() body: any) {
    const householdId = this.getHouseholdId(req);
    return this.mealPlanService.updateMeal(req.user.id, householdId, id, body);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Req() req, @Param('id') id: string) {
    const householdId = this.getHouseholdId(req);
    return this.mealPlanService.removeMeal(req.user.id, householdId, id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  @UseGuards(SupabaseGuard)
  getRange(
    @Req() req,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.mealPlanService.getPlanForRange(req.user.id, start, end);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  add(@Req() req, @Body() body: any) {
    return this.mealPlanService.addMeal(req.user.id, body);
  }

  @Put(':id')
  @UseGuards(SupabaseGuard)
  update(@Req() req, @Param('id') id: string, @Body() body: any) {
    return this.mealPlanService.updateMeal(req.user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Req() req, @Param('id') id: string) {
    return this.mealPlanService.removeMeal(req.user.id, id);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private readonly mealPlanService: MealPlanService) {}

  @Get()
  getRange(
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.mealPlanService.getPlanForRange(start, end);
  }

  @Post()
  add(@Body() body: any) {
    return this.mealPlanService.addMeal(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.mealPlanService.updateMeal(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mealPlanService.removeMeal(id);
  }
}
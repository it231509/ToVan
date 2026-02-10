import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get()
  async getList() {
    return this.shoppingListService.getList();
  }

  @Post()
  async addItem(@Body() body: { item_name: string, amount?: number, unit?: string, category?: string }) {
    return this.shoppingListService.addItem(body);
  }

  @Post('generate')
  async generate(@Body() body: { start: string, end: string }) {
    return this.shoppingListService.generateFromMealPlan(body.start, body.end);
  }

  @Patch(':id/toggle')
  async toggleItem(@Param('id') id: string, @Body('is_checked') isChecked: boolean) {
    return this.shoppingListService.toggleItem(id, isChecked);
  }

  @Delete(':id')
  async removeItem(@Param('id') id: string) {
    return this.shoppingListService.removeItem(id);
  }

  @Delete('actions/clear-checked')
  async clearChecked() {
    return this.shoppingListService.clearChecked();
  }
}
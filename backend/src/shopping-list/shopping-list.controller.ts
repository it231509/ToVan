import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('shopping-list')
@UseGuards(SupabaseGuard)
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get()
  @UseGuards(SupabaseGuard)
  async getList(@Req() req) {
    return this.shoppingListService.getList(req.user.id);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  async addItem(@Req() req, @Body() body: { item_name: string, amount?: number, unit?: string, category?: string }) {
    return this.shoppingListService.addItem(req.user.id, body);
  }

  @Post('generate')
  @UseGuards(SupabaseGuard)
  async generate(@Req() req, @Body() body: { start: string, end: string }) {
    return this.shoppingListService.generateFromMealPlan(req.user.id, body.start, body.end);
  }

  @Patch(':id/toggle')
  @UseGuards(SupabaseGuard)
  async toggleItem(@Req() req, @Param('id') id: string, @Body('is_checked') isChecked: boolean) {
    return this.shoppingListService.toggleItem(req.user.id, id, isChecked);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  async removeItem(@Req() req, @Param('id') id: string) {
    return this.shoppingListService.removeItem(req.user.id, id);
  }

  @Delete('actions/clear-checked')
  @UseGuards(SupabaseGuard)
  async clearChecked(@Req() req) {
    return this.shoppingListService.clearChecked(req.user.id);
  }
}
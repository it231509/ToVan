import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('shopping-list')
@UseGuards(SupabaseGuard)
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  private getHouseholdId(req: any): string {
    const id = req.headers['x-household-id'];
    if (!id) {
      throw new BadRequestException('Keine Haushalts-ID im Header (x-household-id) gefunden.');
    }
    return id;
  }

  @Get()
  async getList(@Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.shoppingListService.getList(req.user.id, householdId);
  }

  @Post()
  async addItem(@Req() req, @Body() body: { item_name: string, amount?: number, unit?: string, category?: string }) {
    const householdId = this.getHouseholdId(req);
    return this.shoppingListService.addItem(req.user.id, householdId, body);
  }

  @Post('generate')
  async generate(@Req() req, @Body() body: { start: string, end: string }) {
    const householdId = this.getHouseholdId(req);
    return this.shoppingListService.generateFromMealPlan(req.user.id, householdId, body.start, body.end);
  }

  @Patch(':id/toggle')
  async toggleItem(@Req() req, @Param('id') id: string, @Body('is_checked') isChecked: boolean) {
    const householdId = this.getHouseholdId(req);
    return this.shoppingListService.toggleItem(req.user.id, householdId, id, isChecked);
  }

  @Delete(':id')
  async removeItem(@Req() req, @Param('id') id: string) {
    const householdId = this.getHouseholdId(req);
    return this.shoppingListService.removeItem(req.user.id, householdId, id);
  }

  @Delete('actions/clear-checked')
  async clearChecked(@Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.shoppingListService.clearChecked(req.user.id, householdId);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, Patch } from '@nestjs/common';
import { ShoppingListService } from './shopping-list.service';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  // 1. Alle Items auf der Liste abrufen
  @Get()
  async getList() {
    return this.shoppingListService.getList();
  }

  // 2. Ein neues Item manuell hinzufügen (z.B. "Hafermilch")
  @Post()
  async addItem(@Body() body: { item_name: string, amount?: number, unit?: string, category?: string }) {
    return this.shoppingListService.addItem(body);
  }

  @Post('generate')
  async generate(@Body() body: { start: string, end: string }) {
    return this.shoppingListService.generateFromMealPlan(body.start, body.end);
  }

  // 3. Ein Item als "erledigt" markieren oder demarkieren (Abhaken)
  @Patch(':id/toggle')
  async toggleItem(@Param('id') id: string, @Body('is_checked') isChecked: boolean) {
    return this.shoppingListService.toggleItem(id, isChecked);
  }

  // 4. Ein einzelnes Item komplett löschen
  @Delete(':id')
  async removeItem(@Param('id') id: string) {
    return this.shoppingListService.removeItem(id);
  }

  // 5. Aufräumen: Alle abgehakten Items von der Liste entfernen
  @Delete('actions/clear-checked')
  async clearChecked() {
    return this.shoppingListService.clearChecked();
  }
}
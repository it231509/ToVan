import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  private getHouseholdId(req: any): string {
    const id = req.headers['x-household-id'];
    if (!id) {
      throw new BadRequestException('Keine Haushalts-ID im Header (x-household-id) gefunden.');
    }
    return id;
  }

  @Get()
  @UseGuards(SupabaseGuard)
  getAll(@Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.recipesService.findAll(req.user.id, householdId);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  getOne(@Param('id') id: string, @Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.recipesService.findOne(id, req.user.id, householdId);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() body: any, @Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.recipesService.create(body, req.user.id, householdId);
  }

  @Put(':id')
  @UseGuards(SupabaseGuard)
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.recipesService.update(id, body, req.user.id, householdId);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @Req() req) {
    const householdId = this.getHouseholdId(req);
    return this.recipesService.remove(id, req.user.id, householdId);
  }
}
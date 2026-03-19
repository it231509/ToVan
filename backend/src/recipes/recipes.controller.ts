import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  @UseGuards(SupabaseGuard)
  getAll(@Req() req) {
    return this.recipesService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(SupabaseGuard)
  getOne(@Param('id') id: string, @Req() req) {
    return this.recipesService.findOne(id, req.user.id);
  }

  @Post()
  @UseGuards(SupabaseGuard)
  create(@Body() body: any, @Req() req) {
    console.log('User aus Token:', req.user);
    return this.recipesService.create(body, req.user.id);
  }

  @Put(':id')
  @UseGuards(SupabaseGuard)
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.recipesService.update(id, body, req.user.id);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.recipesService.remove(id, req.user.id);
  }
}
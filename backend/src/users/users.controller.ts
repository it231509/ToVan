import { Controller, Post, Get, Patch, Req, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Initiales Setup nach dem Registrieren
   */
  @Post('setup-profile')
  @UseGuards(SupabaseGuard)
  async setupProfile(@Req() req) {
    return this.usersService.initializeUser(req.user.id, req.user.email);
  }

  /**
   * Haushalts-Daten für die Startseite abrufen
   */
  @Get('household')
  @UseGuards(SupabaseGuard)
  async getHousehold(@Req() req) {
    return this.usersService.getHouseholdDetails(req.user.id);
  }

  /**
   * Haushalt umbenennen
   */
  @Patch('household/name')
  @UseGuards(SupabaseGuard)
  async updateName(@Req() req, @Body('name') name: string) {
    return this.usersService.updateHouseholdName(req.user.id, name);
  }

  /**
   * Mitglied per E-Mail einladen
   */
  @Post('invite')
  @UseGuards(SupabaseGuard)
  async inviteUser(@Req() req, @Body('email') email: string) {
    return this.usersService.addUserToHousehold(req.user.id, email);
  }
}
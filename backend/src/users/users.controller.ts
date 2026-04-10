import { Controller, Post, Get, Patch, Req, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getHouseholdIdFromHeader(req: any): string | undefined {
    return req.headers['x-household-id'];
  }

  @Post('setup-profile')
  @UseGuards(SupabaseGuard)
  async setupProfile(@Req() req) {
    return this.usersService.initializeUser(req.user.id, req.user.email);
  }

  @Post('create-shared')
  @UseGuards(SupabaseGuard)
  async createShared(@Req() req, @Body('name') name: string) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Ein Name für den Haushalt ist erforderlich');
    }
    return this.usersService.createSharedHousehold(req.user.id, name);
  }

  @Get('my-households')
  @UseGuards(SupabaseGuard)
  async getMyHouseholds(@Req() req) {
    return this.usersService.getMyHouseholds(req.user.id);
  }

  @Get('household')
  @UseGuards(SupabaseGuard)
  async getHousehold(@Req() req) {
    const householdId = this.getHouseholdIdFromHeader(req);
    return this.usersService.getHouseholdDetails(req.user.id, householdId);
  }

  @Patch('household/name')
  @UseGuards(SupabaseGuard)
  async updateName(@Req() req, @Body('name') name: string) {
    const householdId = this.getHouseholdIdFromHeader(req);
    
    if (!householdId) {
      throw new BadRequestException('Keine x-household-id im Header gefunden');
    }
    
    return this.usersService.updateHouseholdName(req.user.id, name, householdId);
  }

  @Post('invite')
  @UseGuards(SupabaseGuard)
  async inviteUser(@Req() req, @Body('email') email: string) {
    const householdId = this.getHouseholdIdFromHeader(req);

    if (!householdId) {
      throw new BadRequestException('Keine x-household-id im Header gefunden');
    }

    return this.usersService.createInvitation(req.user.id, email, householdId);
  }

  @Get('invitations')
  @UseGuards(SupabaseGuard)
  async getInvitations(@Req() req) {
    console.log('Anfrage Einladungen für:', req.user?.email);
    
    if (!req.user?.email) {
      throw new BadRequestException('Nutzer-E-Mail konnte nicht aus dem Token gelesen werden.');
    }
    
    return this.usersService.getPendingInvitations(req.user.email);
  }

  @Post('accept-invitation')
  @UseGuards(SupabaseGuard)
  async acceptInvite(@Req() req, @Body('token') token: string) {
    return this.usersService.acceptInvitation(token, req.user.id, req.user.email);
  }

  @Post('household/leave')
  @UseGuards(SupabaseGuard)
  async leaveHousehold(@Req() req, @Body('householdId') householdId: string) {
    if (!householdId) {
      throw new BadRequestException('Haushalt-ID ist erforderlich');
    }
    return this.usersService.leaveOrDeleteHousehold(req.user.id, householdId);
  }
}
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

  return this.usersService.addUserToHousehold(req.user.id, email, householdId);
}
}
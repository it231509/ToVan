import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getHouseholdId(userId: string, providedId?: string): Promise<string> {
    const query = this.supabaseService.client
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId);

    if (providedId) {
      query.eq('household_id', providedId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      throw new ForbiddenException('Kein Zugriff auf diesen Haushalt oder keine Mitgliedschaft vorhanden');
    }

    return providedId ? data[0].household_id : data[0].household_id;
  }

  async getMyHouseholds(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('household_members')
      .select(`
        role,
        household:households (id, name)
      `)
      .eq('user_id', userId);

    if (error) throw new BadRequestException('Fehler beim Laden der Haushalte');
    return data;
  }

  async initializeUser(userId: string, email: string) {
    const { data: existingMember } = await this.supabaseService.client
      .from('household_members')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) return { message: 'Profil bereits initialisiert' };

    const { data: household, error: hError } = await this.supabaseService.client
      .from('households')
      .insert([{ name: `Haushalt von ${email.split('@')[0]}` }])
      .select()
      .single();

    if (hError) throw new BadRequestException('Haushalt konnte nicht erstellt werden');

    await this.supabaseService.client
      .from('household_members')
      .insert([{ household_id: household.id, user_id: userId, role: 'admin' }]);

    return { householdId: household.id, status: 'success' };
  }

  async getHouseholdDetails(userId: string, providedId?: string) {
    const householdId = await this.getHouseholdId(userId, providedId);

    const { data: household, error: hError } = await this.supabaseService.client
      .from('households')
      .select(`id, name, members:household_members (user_id, role)`)
      .eq('id', householdId)
      .single();

    if (hError) throw new NotFoundException('Haushalt nicht gefunden');

    const { data: authData } = await this.supabaseService.client.auth.admin.listUsers();
    
    const membersWithNames = household.members.map((member: any) => {
      const authUser = authData?.users.find((u: any) => u.id === member.user_id);
      return {
        ...member,
        display_name: authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || member.user_id
      };
    });

    return { ...household, members: membersWithNames };
  }

  async updateHouseholdName(userId: string, newName: string, providedId: string) {
    const householdId = await this.getHouseholdId(userId, providedId);
    const { data, error } = await this.supabaseService.client
      .from('households')
      .update({ name: newName })
      .eq('id', householdId)
      .select()
      .single();

    if (error) throw new BadRequestException('Update fehlgeschlagen');
    return data;
  }

  async addUserToHousehold(adminUserId: string, emailToAdd: string, adminProvidedId: string) {
    const adminHouseholdId = await this.getHouseholdId(adminUserId, adminProvidedId);

    const { data: authData } = await this.supabaseService.client.auth.admin.listUsers();
    const targetUser = authData.users.find((u: any) => u.email?.toLowerCase() === emailToAdd.toLowerCase());
    if (!targetUser) throw new NotFoundException('User nicht gefunden');

    const { error: inviteError } = await this.supabaseService.client
      .from('household_members')
      .insert([{ household_id: adminHouseholdId, user_id: targetUser.id, role: 'member' }]);

    if (inviteError) throw new BadRequestException('User ist bereits Mitglied in diesem Haushalt');

    return { message: 'Erfolgreich zum Haushalt hinzugefügt' };
  }
}
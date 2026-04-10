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
      throw new ForbiddenException('Kein Zugriff auf diesen Haushalt');
    }

    return providedId ? data[0].household_id : data[0].household_id;
  }

  async getMyHouseholds(userId: string) {
    const { data, error } = await this.supabaseService.client
      .from('household_members')
      .select(`
        role,
        household:households (id, name, type)
      `)
      .eq('user_id', userId);

    if (error) throw new BadRequestException('Fehler beim Laden der Haushalte');
    return data;
  }

  async initializeUser(userId: string, email: string) {
    const { data: alreadyExists } = await this.supabaseService.client
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId);

    if (alreadyExists && alreadyExists.length > 0) {
      return { householdId: alreadyExists[0].household_id, status: 'already_initialized' };
    }

    const { data: household, error: hError } = await this.supabaseService.client
      .from('households')
      .insert([{ 
        type: 'personal', 
        name: 'Privat',
      }])
      .select()
      .single();

    if (hError) throw new BadRequestException('Fehler beim Erstellen des Haushalts');

    const { data: raceConditionCheck } = await this.supabaseService.client
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId);

    if (raceConditionCheck && raceConditionCheck.length > 0) {
      await this.supabaseService.client.from('households').delete().eq('id', household.id);
      return { householdId: raceConditionCheck[0].household_id, status: 'recovered_from_race' };
    }

    const { error: mError } = await this.supabaseService.client
      .from('household_members')
      .insert([{ 
        household_id: household.id, 
        user_id: userId, 
        role: 'admin' 
      }]);

    if (mError) {
      await this.supabaseService.client.from('households').delete().eq('id', household.id);
      throw new BadRequestException('Fehler beim Zuweisen des Haushalts');
    }

    return { householdId: household.id, status: 'success' };
  }

  async createSharedHousehold(userId: string, name: string) {
    const { data: memberships } = await this.supabaseService.client
      .from('household_members')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (memberships && memberships.length >= 5) {
      throw new BadRequestException('Du hast das Maximum an Haushalten erreicht (max. 4 geteilte Haushalte).');
    }

    const { data: household, error: hError } = await this.supabaseService.client
      .from('households')
      .insert([{ 
        type: 'shared', 
        name: name 
      }])
      .select()
      .single();

    if (hError) throw new BadRequestException('Fehler beim Erstellen des geteilten Haushalts');

    const { error: mError } = await this.supabaseService.client
      .from('household_members')
      .insert([{ 
        household_id: household.id, 
        user_id: userId, 
        role: 'admin' 
      }]);

    if (mError) {
      await this.supabaseService.client.from('households').delete().eq('id', household.id);
      throw new BadRequestException('Fehler beim Zuweisen des Haushalts');
    }

    return { householdId: household.id, status: 'success' };
  }

  async getHouseholdDetails(userId: string, providedId?: string) {
    const householdId = await this.getHouseholdId(userId, providedId);

    const { data: household, error: hError } = await this.supabaseService.client
      .from('households')
      .select(`id, name, type, members:household_members (user_id, role)`)
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
      .select('id, name, type')
      .single();

    if (error) throw new BadRequestException('Update fehlgeschlagen');
    return data;
  }

  async createInvitation(inviterId: string, emailToInvite: string, householdId: string) {
    const id = await this.getHouseholdId(inviterId, householdId);

    const { data: household } = await this.supabaseService.client
      .from('households')
      .select('type')
      .eq('id', id)
      .single();

    if (household?.type === 'personal') {
      throw new BadRequestException('In privaten Haushalten können keine Mitglieder eingeladen werden.');
    }

    const { error } = await this.supabaseService.client
      .from('household_invitations')
      .insert([{
        household_id: id,
        inviter_id: inviterId,
        email: emailToInvite.toLowerCase(),
        status: 'pending'
      }]);

    if (error) throw new BadRequestException('Einladung konnte nicht erstellt werden oder User ist bereits eingeladen.');
    
    return { message: 'Einladung wurde versendet' };
  }

  async getPendingInvitations(userEmail: string) {
    const { data, error } = await this.supabaseService.client
      .from('household_invitations')
      .select(`
        id,
        token,
        household_id,
        households (
          id,
          name
        )
      `)
      .eq('email', userEmail.toLowerCase())
      .eq('status', 'pending');

    if (error) {
      console.error('Supabase Error Invitations:', error);
      throw new BadRequestException('Fehler beim Laden der Einladungen: ' + error.message);
    }
    
    return data;
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const { data: invite, error: inviteError } = await this.supabaseService.client
      .from('household_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invite) throw new NotFoundException('Einladung nicht gefunden oder bereits abgelaufen');
    if (invite.email !== userEmail.toLowerCase()) throw new ForbiddenException('Diese Einladung ist nicht für deine E-Mail bestimmt');

    const { error: mError } = await this.supabaseService.client
      .from('household_members')
      .insert([{ household_id: invite.household_id, user_id: userId, role: 'member' }]);

    if (mError) throw new BadRequestException('Du bist bereits Mitglied in diesem Haushalt');

    await this.supabaseService.client
      .from('household_invitations')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    return { householdId: invite.household_id, status: 'success' };
  }

  async leaveOrDeleteHousehold(userId: string, householdId: string) {
    const { data: member, error: mError } = await this.supabaseService.client
      .from('household_members')
      .select('role, household:households(type)')
      .eq('user_id', userId)
      .eq('household_id', householdId)
      .single();

    if (mError || !member) {
      throw new ForbiddenException('Du bist kein Mitglied dieses Haushalts');
    }

    if (member.household['type'] === 'personal') {
      throw new BadRequestException('Der persönliche Haushalt kann nicht verlassen oder gelöscht werden.');
    }

    if (member.role === 'admin') {
      const { error: deleteError } = await this.supabaseService.client
        .from('households')
        .delete()
        .eq('id', householdId);

      if (deleteError) throw new BadRequestException('Fehler beim Löschen des Haushalts');
      return { message: 'Haushalt wurde erfolgreich gelöscht' };
      
    } else {
      const { error: exitError } = await this.supabaseService.client
        .from('household_members')
        .delete()
        .eq('user_id', userId)
        .eq('household_id', householdId);

      if (exitError) throw new BadRequestException('Fehler beim Verlassen des Haushalts');
      return { message: 'Haushalt wurde erfolgreich verlassen' };
    }
  }
}

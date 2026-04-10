<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/supabase';
import { useRouter } from 'vue-router';
import backend, { getMyHouseholds } from '@/http';

const household = ref(null);
const allMemberships = ref([]);
const pendingInvitations = ref([]); 
const newName = ref('');
const newSharedHouseholdName = ref(''); 
const inviteEmail = ref('');
const statusMsg = ref('');
const isEditing = ref(false);
const isCreating = ref(false); 
const router = useRouter()

const fetchAllData = async () => {
  try {
    const res = await getMyHouseholds();
    allMemberships.value = res;
    
    if (!localStorage.getItem('active_household_id') && res.length > 0) {
      localStorage.setItem('active_household_id', res[0].household.id);
    }
    
    if (res.length > 0) {
      await fetchActiveHouseholdDetails();
    }
  } catch (e) {
    console.error("Fehler beim Laden der Haushalte:", e);
  }

  fetchInvitations();
};

const fetchInvitations = async () => {
  try {
    const res = await backend.get('/users/invitations');
    pendingInvitations.value = res.data || [];
  } catch (e) {
    console.error("Einladungen konnten nicht geladen werden");
    pendingInvitations.value = [];
  }
};

const fetchActiveHouseholdDetails = async () => {
  try {
    const res = await backend.get('/users/household');
    const details = res.data;
    const match = allMemberships.value.find(m => m.household.id === details.id);
    if (match && !details.type) details.type = match.household.type;
    household.value = details;
    newName.value = details.name;
  } catch (e) {
    console.error("Details Fehler:", e);
  }
};

const switchHousehold = async (id) => {
  localStorage.setItem('active_household_id', id);
  statusMsg.value = "";
  await fetchActiveHouseholdDetails();
};

const saveName = async () => {
  try {
    await backend.patch('/users/household/name', { name: newName.value });
    household.value.name = newName.value;
    isEditing.value = false;
    statusMsg.value = "Name aktualisiert!";
    fetchAllData();
  } catch (e) {
    statusMsg.value = "Fehler beim Speichern.";
  }
};

const createSharedHousehold = async () => {
  if (!newSharedHouseholdName.value.trim()) return;
  try {
    const res = await backend.post('/users/create-shared', { name: newSharedHouseholdName.value });
    statusMsg.value = "Haushalt erstellt!";
    newSharedHouseholdName.value = '';
    isCreating.value = false;
    await fetchAllData();
    await switchHousehold(res.data.householdId);
  } catch (e) {
    statusMsg.value = e.response?.data?.message || "Fehler beim Erstellen.";
  }
};

const acceptInvitation = async (token) => {
  try {
    const res = await backend.post('/users/accept-invitation', { token });
    statusMsg.value = "Einladung erfolgreich angenommen!";
    await fetchAllData();
    await switchHousehold(res.data.householdId);
  } catch (e) {
    statusMsg.value = "Fehler beim Beitreten.";
  }
};

const inviteUser = async () => {
  try {
    await backend.post('/users/invite', { email: inviteEmail.value });
    statusMsg.value = "Einladung erfolgreich versendet!";
    inviteEmail.value = '';
  } catch (e) {
    statusMsg.value = e.response?.data?.message || "Fehler beim Versenden.";
  }
};

const handleLeaveOrDelete = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const currentMember = household.value.members.find(m => m.user_id === user.id);
  const isAdmin = currentMember?.role === 'admin';
  
  const actionText = isAdmin 
    ? 'löschen (alle Daten dieses Haushalts werden unwiderruflich entfernt)' 
    : 'verlassen';

  if (!confirm(`Möchtest du diesen Haushalt wirklich ${actionText}?`)) return;

  try {
    await backend.post('/users/household/leave', { householdId: household.value.id });
    
    statusMsg.value = isAdmin ? "Haushalt gelöscht." : "Haushalt verlassen.";
    
    localStorage.removeItem('active_household_id');
    household.value = null;
    await fetchAllData();
  } catch (e) {
    statusMsg.value = e.response?.data?.message || "Fehler beim Ausführen der Aktion.";
  }
};

const currentUserRole = computed(() => {
  if (!household.value || !allMemberships.value) return 'member';
  const m = allMemberships.value.find(m => m.household.id === household.value.id);
  return m?.role || 'member';
});

onMounted(() => {
  fetchAllData();
});
</script>

<template>
  <div class="max-w-2xl mx-auto pt-0 space-y-6 pb-20 transition-colors duration-300">
    
    <div v-if="pendingInvitations.length > 0" class="space-y-3">
      <h1 class="font-bold text-primary uppercase text-xs tracking-widest animate-pulse">Neue Einladungen!</h1>
      <div v-for="invite in pendingInvitations" :key="invite.id" 
           class="bg-primary text-white p-5 rounded-[2rem] shadow-lg flex justify-between items-center animate-in zoom-in duration-300">
        <div>
          <p class="text-xs opacity-80 uppercase font-bold">Einladung zu</p>
          <h2 class="text-lg font-black">{{ invite.households?.name }}</h2>
        </div>
        <button @click="acceptInvitation(invite.token)" class="btn btn-sm rounded-xl bg-white text-primary border-none hover:bg-white/90">
          Annehmen
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h1 class="font-bold text-base-content/60 uppercase text-xs tracking-widest">Meine Haushalte</h1>
      <div class="flex flex-wrap gap-3 items-center">
        <button 
          v-for="m in allMemberships" 
          :key="m.household.id"
          @click="switchHousehold(m.household.id)"
          :class="[
            'px-6 py-3 rounded-full whitespace-nowrap font-bold transition-all border shadow-sm flex items-center gap-2',
            household?.id === m.household.id 
              ? 'bg-primary text-white border-primary' 
              : 'bg-base-100 text-base-content border-base-300 hover:border-primary/50'
          ]"
          style="font-size: 14px;"
        >
          {{ m.household.name }}
          <span v-if="m.household.type === 'personal'" class="opacity-50 text-[10px] uppercase tracking-tighter">Privat</span>
        </button>
        
        <button @click="isCreating = !isCreating" class="btn btn-circle btn-ghost border-2 border-dashed border-base-300">
          <svg v-if="!isCreating" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div v-if="isCreating" class="p-4 bg-base-100 border border-base-300 rounded-3xl mt-2 animate-in slide-in-from-top-2">
        <h3 class="text-sm font-bold mb-3 uppercase tracking-wider text-base-content/60">Geteilten Haushalt anlegen</h3>
        <div class="flex gap-3 flex-col md:flex-row">
          <input v-model="newSharedHouseholdName" placeholder="Name (z.B. WG, Familie)" class="input input-bordered w-full rounded-2xl bg-base-200" />
          <button @click="createSharedHousehold" class="btn btn-primary rounded-2xl">Erstellen</button>
        </div>
      </div>
    </div>

    <div v-if="household" class="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-300">
      <div class="flex justify-between items-start">
        <div v-if="!isEditing">
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-black text-base-content leading-tight">{{ household.name }}</h1>
            <div v-if="household.type === 'personal'" class="badge badge-ghost text-[10px] uppercase font-bold opacity-50">Persönlich</div>
          </div>
          <button @click="isEditing = true" class="text-xs text-primary font-bold uppercase mt-1 tracking-wider hover:opacity-80">Name bearbeiten</button>
        </div>
        <div v-else class="flex gap-2 flex-col w-full">
          <input v-model="newName" class="input input-bordered rounded-2xl w-full bg-base-200 border-base-300 focus:ring-primary" />
          <div class="flex flex-col gap-2">
            <button @click="saveName" class="btn btn-primary btn-md rounded-2xl">Speichern</button>
            <button @click="isEditing = false" class="btn btn-ghost btn-md rounded-2xl">Abbrechen</button>
          </div>
        </div>
      </div>

      <div v-if="household.type === 'shared'" class="space-y-4 mt-6">
        <h3 class="font-bold text-base-content/60 uppercase text-xs tracking-widest">Mitglieder</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="member in household.members" :key="member.user_id" 
              class="badge badge-lg py-5 px-5 bg-base-200 border-base-300 text-base-content font-semibold rounded-2xl">
                {{ member.display_name }}
                <span v-if="member.role === 'admin'" class="ml-2 opacity-40 text-[10px]">Admin</span>
          </div>
        </div>
      </div>

      <div v-if="household.type !== 'personal'" class="divider opacity-20 my-2"></div>
      <div v-if="household.type !== 'personal'" class="flex flex-col md:flex-row">
        <button @click="handleLeaveOrDelete" class="btn btn-error text-white rounded-2xl">{{ currentUserRole === 'admin' ? 'Haushalt löschen' : 'Haushalt verlassen' }}</button>
      </div>
    </div>

    <div v-if="household && household.type !== 'personal'" class="bg-primary/10 p-6 rounded-3xl border border-primary/20">
      <h3 class="font-bold text-base-content mb-2">Jemanden einladen</h3>
      <p class="text-sm text-base-content/70 mb-6">Der User sieht die Einladung direkt in seinem Dashboard.</p>
      
      <div class="flex gap-3 flex-col md:flex-row">
        <input v-model="inviteEmail" type="email" placeholder="beispiel@email.de" 
               class="input w-full rounded-2xl border-none shadow-inner bg-base-200" />
        <button @click="inviteUser" class="btn btn-primary rounded-2xl px-8">Einladen</button>
      </div>
    </div>

    <div v-else-if="household && household.type === 'personal'" class="p-6 text-center border-2 border-dashed border-base-300 rounded-3xl opacity-60">
      <p class="text-xs font-bold uppercase tracking-widest text-base-content/40">Privater Bereich</p>
      <p class="text-sm mt-1 text-base-content/60 leading-tight">Hier können keine Mitglieder hinzugefügt werden.</p>
    </div>

    <p v-if="statusMsg" class="mt-4 text-sm font-bold text-primary text-center bg-base-100 py-3 rounded-2xl border border-primary/10 animate-pulse">
      {{ statusMsg }}
    </p>

    <div v-if="!household" class="text-center py-20">
      <span class="loading loading-ring loading-lg text-primary"></span>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
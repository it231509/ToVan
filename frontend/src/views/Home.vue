<script setup>
import { ref, onMounted } from 'vue';
import backend, { getMyHouseholds } from '@/http';

const household = ref(null);
const allMemberships = ref([]);
const newName = ref('');
const inviteEmail = ref('');
const statusMsg = ref('');
const isEditing = ref(false);

const fetchAllMemberships = async () => {
  try {
    const res = await getMyHouseholds();
    allMemberships.value = res;
    
    if (!localStorage.getItem('active_household_id') && res.length > 0) {
      localStorage.setItem('active_household_id', res[0].household.id);
    }
    
    await fetchActiveHouseholdDetails();
  } catch (e) {
    console.error("Fehler beim Laden der Haushaltsliste");
  }
};

const fetchActiveHouseholdDetails = async () => {
  try {
    const res = await backend.get('/users/household');
    household.value = res.data;
    newName.value = res.data.name;
  } catch (e) {
    console.error("Fehler beim Laden der Haushalts-Details");
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
    fetchAllMemberships();
  } catch (e) {
    statusMsg.value = "Fehler beim Speichern.";
  }
};

const inviteUser = async () => {
  try {
    await backend.post('/users/invite', { email: inviteEmail.value });
    statusMsg.value = "User erfolgreich hinzugefügt!";
    inviteEmail.value = '';
    fetchActiveHouseholdDetails();
  } catch (e) {
    statusMsg.value = "User nicht gefunden oder bereits Mitglied.";
  }
};

onMounted(fetchAllMemberships);
</script>

<template>
  <div class="max-w-2xl mx-auto pt-2 space-y-6 pb-20 transition-colors duration-300">
    
    <div class="space-y-3">
      <h3 class="font-bold text-base-content/60 uppercase text-xs tracking-widest">Meine Haushalte</h3>
      <div class="flex gap-3 overflow-x-auto pb-2 px-2 no-scrollbar">
        <button 
          v-for="m in allMemberships" 
          :key="m.household.id"
          @click="switchHousehold(m.household.id)"
          :class="[
            'px-6 py-3 rounded-full whitespace-nowrap font-bold transition-all border shadow-sm',
            household?.id === m.household.id 
              ? 'bg-primary text-white border-primary scale-105' 
              : 'bg-base-100 text-base-content border-base-300 hover:border-primary/50'
          ]"
        >
          {{ m.household.name }}
        </button>
      </div>
    </div>

    <hr class="border-base-300 mx-6 opacity-50">

    <div v-if="household" class="bg-base-100 p-6 rounded-[2.5rem] shadow-sm border border-base-300">
      <div class="flex justify-between items-start mb-6">
        <div v-if="!isEditing">
          <h1 class="text-3xl font-black text-base-content leading-tight">{{ household.name }}</h1>
          <button @click="isEditing = true" class="text-xs text-primary font-bold uppercase mt-1 tracking-wider hover:opacity-80">Name bearbeiten</button>
        </div>
        <div v-else class="flex gap-2 flex-col w-full">
          <input v-model="newName" class="input input-bordered rounded-2xl w-full bg-base-200 border-base-300 focus:ring-primary" />
          <div class="flex gap-2">
            <button @click="saveName" class="btn btn-primary btn-sm rounded-xl flex-1">Speichern</button>
            <button @click="isEditing = false" class="btn btn-ghost btn-sm rounded-xl">Abbrechen</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-base-content/60 uppercase text-xs tracking-widest">Mitglieder in diesem Haushalt</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="member in household.members" :key="member.user_id" 
               class="badge badge-lg py-5 px-5 bg-base-200 border-base-300 text-base-content font-semibold rounded-2xl">
                {{ member.display_name }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="household" class="bg-primary/10 p-8 rounded-[2.5rem] border border-primary/20">
      <h3 class="font-bold text-base-content mb-2">Jemanden zu "{{ household.name }}" hinzufügen</h3>
      <p class="text-sm text-base-content/70 mb-6">Teile diesen Haushalt mit anderen, um gemeinsam Rezepte und Pläne zu verwalten.</p>
      
      <div class="flex gap-3 flex-col md:flex-row">
        <input v-model="inviteEmail" type="email" placeholder="beispiel@email.de" 
               class="input w-full rounded-2xl border-none shadow-inner bg-base-200 focus:ring-2 focus:ring-primary/20" />
        <button @click="inviteUser" class="btn btn-primary rounded-2xl px-8 shadow-lg shadow-primary/20">Hinzufügen</button>
      </div>
      <p v-if="statusMsg" class="mt-4 text-sm font-bold text-primary text-center bg-base-100 py-2 rounded-xl border border-primary/10">{{ statusMsg }}</p>
    </div>

    <div v-else class="text-center py-20">
      <span class="loading loading-ring loading-lg text-primary"></span>
      <p class="text-base-content/40 mt-4 font-medium">Lade deinen Haushalt...</p>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
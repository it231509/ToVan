<script setup>
import { ref, onMounted } from 'vue';
import backend from '@/http';

const household = ref(null);
const newName = ref('');
const inviteEmail = ref('');
const statusMsg = ref('');
const isEditing = ref(false);

const fetchHousehold = async () => {
  try {
    const res = await backend.get('/users/household');
    household.value = res.data;
    newName.value = res.data.name;
  } catch (e) {
    console.error("Fehler beim Laden des Haushalts");
  }
};

const saveName = async () => {
  try {
    await backend.patch('/users/household/name', { name: newName.value });
    household.value.name = newName.value;
    isEditing.value = false;
    statusMsg.value = "Name aktualisiert!";
  } catch (e) {
    statusMsg.value = "Fehler beim Speichern.";
  }
};

const inviteUser = async () => {
  try {
    await backend.post('/users/invite', { email: inviteEmail.value });
    statusMsg.value = "User erfolgreich hinzugefügt!";
    inviteEmail.value = '';
    fetchHousehold();
  } catch (e) {
    statusMsg.value = "User nicht gefunden oder bereits Mitglied.";
  }
};

onMounted(fetchHousehold);
</script>

<template>
  <div class="max-w-2xl mx-auto pt-2 space-y-6">
    <div v-if="household" class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div class="flex justify-between items-center mb-6">
        <div v-if="!isEditing">
          <h1 class="text-3xl font-black text-slate-800">Haushalt: {{ household.name }}</h1>
          <button @click="isEditing = true" class="text-xs text-primary font-bold uppercase mt-1">Namen ändern</button>
        </div>
        <div v-else class="flex gap-2 flex-col md:flex-row w-[100%] md:w-auto">
          <input v-model="newName" class="input input-bordered rounded-xl" />
          <button @click="saveName" class="btn btn-primary rounded-xl">Speichern</button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-bold text-slate-500 uppercase text-xs tracking-widest">Mitglieder</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="member in household.members" :key="member.user_id" 
               class="badge badge-lg py-4 px-4 bg-slate-50 border-slate-100 text-slate-600 font-medium">
                <span class="ml-2 font-bold">{{ member.display_name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
      <h3 class="font-bold text-slate-800 mb-2">Jemanden hinzufügen</h3>
      <p class="text-sm text-slate-500 mb-6">Gib die E-Mail eines registrierten Users ein, um ihn deinem Haushalt hinzuzufügen.</p>
      
      <div class="flex gap-4 md:gap-2 flex-col md:flex-row">
        <input v-model="inviteEmail" type="email" placeholder="beispiel@email.de" 
               class="input w-full rounded-2xl border-none shadow-inner" />
        <button @click="inviteUser" class="btn btn-primary rounded-2xl px-8">Hinzufügen</button>
      </div>
      <p v-if="statusMsg" class="mt-4 text-sm font-bold text-primary text-center">{{ statusMsg }}</p>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';

const householdMembers = ref([
  { id: 'u1', name: 'Lukas' },
  { id: 'u2', name: 'Sarah' },
  { id: 'u3', name: 'Tobi' },
]);

const cleaningBundles = ref([
  { id: 1, title: 'Böden & Staub', description: 'Saugen, Wischen, Staubwischen.', icon: '🧹', color: 'bg-blue-500', isDone: false },
  { id: 2, title: 'Bad & WC', description: 'Dusche, Spiegel, WC reinigen.', icon: '🧼', color: 'bg-purple-500', isDone: true },
  { id: 3, title: 'Küche & Müll', description: 'Fronten, Müll, Spüle.', icon: '✨', color: 'bg-emerald-500', isDone: false }
]);

const skipWeeks = ref(0);
const isModalOpen = ref(false);
const newBundle = ref({ title: '', description: '', icon: '✨', color: 'bg-primary' });

const getCurrentWeekNumber = () => {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
};

const getAssignedMember = (bundleIndex) => {
  const week = getCurrentWeekNumber();
  const memberCount = householdMembers.value.length;
  if (memberCount === 0) return null;
  
  const rotationIndex = (week + skipWeeks.value + bundleIndex) % memberCount;
  return householdMembers.value[rotationIndex];
};

const addBundle = () => {
  if (newBundle.value.title) {
    cleaningBundles.value.push({ 
      ...newBundle.value, 
      id: Date.now(), 
      isDone: false 
    });
    newBundle.value = { title: '', description: '', icon: '✨', color: 'bg-primary' };
    isModalOpen.value = false;
  }
};

const removeBundle = (id) => {
  cleaningBundles.value = cleaningBundles.value.filter(b => b.id !== id);
};

const skipCurrentWeek = () => {
  skipWeeks.value++;
};
</script>

<template>
  <div class="lg:container mx-auto p-0 max-w-5xl">
    
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 px-2">
      <div>
        <p class="text-base-content/50 font-bold uppercase text-[10px] tracking-widest mt-1">
          KW {{ getCurrentWeekNumber() }} • {{ cleaningBundles.length }} Bereiche aktiv
        </p>
      </div>
      
      <div class="flex flex-col gap-2 w-full md:w-auto">
        <button @click="skipCurrentWeek" class="btn btn-outline border-base-300 btn-md rounded-xl">
          Woche überspringen
        </button>
        <button @click="isModalOpen = true" class="btn btn-primary btn-md rounded-xl text-white">
          + Neuer Bereich
        </button>
      </div>
    </header>

    <div class="grid grid-cols-1 gap-6">
      <div v-for="(bundle, index) in cleaningBundles" :key="bundle.id" 
           class="relative overflow-hidden bg-base-100 border border-base-300 rounded-3xl p-6 lg:p-8 shadow-sm transition-all">
        
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div class="flex-grow space-y-3">
            <div class="flex items-center gap-4">
              <div>
                <h2 class="text-xl font-black text-base-content">{{ bundle.title }}</h2>
                <button @click="removeBundle(bundle.id)" class="text-[10px] text-error font-bold uppercase hover:underline">Bereich löschen</button>
              </div>
            </div>
            <p class="text-base-content/60 leading-relaxed max-w-xl">{{ bundle.description }}</p>
          </div>

          <div class="flex flex-col gap-3 bg-base-200/50 p-6 rounded-3xl w-full border border-base-300/50">
            <div class="flex flex-col">
                <span class="text-[12px] font-black uppercase text-base-content/30 tracking-widest">Zuständig</span>
                <span v-if="getAssignedMember(index)" class="text-[14px] font-black">{{ getAssignedMember(index).name }}</span>
             </div>
             
             <button @click="bundle.isDone = !bundle.isDone" 
                     class="btn btn-block mt-2 rounded-xl border-none font-black shadow-sm transition-all"
                     :class="bundle.isDone ? 'btn-success text-white' : 'bg-base-300 text-base-content'">
               {{ bundle.isDone ? '✓ Erledigt' : 'Abhaken' }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <dialog class="modal" :class="{'modal-open': isModalOpen}">
      <div class="modal-box rounded-3xl border border-base-300 shadow-2xl bg-base-100">
        <h3 class="font-black text-xl mb-6">Bereich hinzufügen</h3>
        
        <div class="space-y-4">
          <div class="form-control">
            <input v-model="newBundle.title" type="text" placeholder="z.B. Garten" class="input input-bordered rounded-xl bg-base-200 border-base-300 focus:border-primary w-full" />
          </div>
          <div class="form-control">
            <textarea v-model="newBundle.description" class="textarea textarea-bordered rounded-xl bg-base-200 border-base-300 focus:border-primary w-full" placeholder="Was genau ist zu tun?"></textarea>
          </div>
        </div>

        <div class="modal-action flex flex-col">
          <button @click="isModalOpen = false" class="btn btn-ghost rounded-xl font-bold">Abbrechen</button>
          <button @click="addBundle" class="btn btn-primary rounded-xl text-white font-bold">Erstellen</button>
        </div>
      </div>
    </dialog>

    <div class="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center gap-4">
      <p class="text-xs text-primary/80 font-medium leading-relaxed">
        Wenn du eine Woche <strong>überspringst</strong>, rotiert die Zuweisung sofort einen Schritt weiter. Das ist nützlich, wenn jemand im Urlaub ist oder ihr die Rollen manuell tauschen wollt.
      </p>
    </div>
  </div>
</template>

<style scoped>
.stroke-round { stroke-linecap: round; }
</style>
<script setup>
import { ref, onMounted, computed } from 'vue';
import backend from '@/http';

const cleaningTasks = ref([]);
const householdMembers = ref([]);
const isModalOpen = ref(false);
const loading = ref(true);

// NEU: Edit-Status
const isEditMode = ref(false);
const editingTaskId = ref(null);

// Überarbeitetes Objekt für neue Bereiche
const newBundle = ref({ 
  title: '', 
  subtasks: [{ text: '', done: false }],
  icon: '✨' 
});

const getCurrentWeekNumber = () => {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
};

const fetchData = async () => {
  loading.value = true;
  try {
    const hRes = await backend.get('/users/household');
    householdMembers.value = hRes.data.members;

    const cRes = await backend.get('/cleaning/plan');
    cleaningTasks.value = cRes.data.map(t => ({
      ...t,
      description: Array.isArray(t.description) ? t.description : []
    }));
  } catch (e) {
    console.error("Fehler beim Laden des Putzplans", e);
  } finally {
    loading.value = false;
  }
};

// NEU: Modal-Steuerung
const openCreateModal = () => {
  isEditMode.value = false;
  editingTaskId.value = null;
  newBundle.value = { title: '', subtasks: [{ text: '', done: false }], icon: '✨' };
  isModalOpen.value = true;
};

const openEditModal = (task) => {
  isEditMode.value = true;
  editingTaskId.value = task.id;
  // Tiefe Kopie der Unteraufgaben, damit Änderungen nicht sofort im Hintergrund sichtbar sind
  newBundle.value = {
    title: task.title,
    subtasks: JSON.parse(JSON.stringify(task.description)),
    icon: task.icon || '✨'
  };
  isModalOpen.value = true;
};

const addSubtaskInput = () => newBundle.value.subtasks.push({ text: '', done: false });
const removeSubtaskInput = (index) => newBundle.value.subtasks.splice(index, 1);

const toggleSubtask = async (task, subtaskIndex) => {
  task.description[subtaskIndex].done = !task.description[subtaskIndex].done;
  const allDone = task.description.every(st => st.done);
  
  try {
    await backend.patch(`/cleaning/update-content/${task.id}`, { 
      description: task.description 
    });

    if (allDone !== task.is_done) {
        await toggleMainStatus(task, allDone);
    }
  } catch (e) {
    console.error("Fehler beim Speichern der Unteraufgabe");
  }
};

const toggleMainStatus = async (task, forcedStatus = null) => {
  const newStatus = forcedStatus !== null ? forcedStatus : !task.is_done;
  try {
    await backend.post('/cleaning/toggle', { 
      taskId: task.id, 
      isDone: newStatus 
    });
    task.is_done = newStatus;
  } catch (e) {
    console.error("Fehler beim Haupt-Status");
  }
};

// GEÄNDERT: Kombinierte Speicherfunktion für Create & Edit
const saveBundle = async () => {
  if (!newBundle.value.title) return;
  
  const payload = {
    title: newBundle.value.title,
    description: newBundle.value.subtasks.filter(st => st.text.trim() !== '')
  };

  try {
    if (isEditMode.value) {
      await backend.patch(`/cleaning/update-content/${editingTaskId.value}`, payload);
    } else {
      await backend.post('/cleaning/task', payload);
    }
    newBundle.value = { title: '', subtasks: [{ text: '', done: false }], icon: '✨' };
    isModalOpen.value = false;
    fetchData();
  } catch (e) {
    console.error("Fehler beim Speichern");
  }
};

const getAssignedMember = (index) => {
  if (householdMembers.value.length === 0) return 'Niemand';
  const week = getCurrentWeekNumber();
  const rotationIndex = (week + index) % householdMembers.value.length;
  return householdMembers.value[rotationIndex].display_name;
};

const removeTask = async (id) => {
  if (!confirm('Bereich wirklich löschen?')) return;
  try {
    await backend.delete(`/cleaning/task/${id}`);
    fetchData();
  } catch (e) {
    console.error("Fehler beim Löschen");
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="lg:container mx-auto p-0 max-w-5xl">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 px-3 lg:px-0">
      <div>
        <h1 class="font-bold text-base-content/60 uppercase text-xs tracking-widest">KW {{ getCurrentWeekNumber() }} • {{ cleaningTasks.length }} Bereiche</h1>
      </div>
      <button @click="openCreateModal" class="w-full md:w-auto btn btn-primary rounded-xl text-white">
        Bereich hinzufügen
      </button>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <span class="loading loading-ring loading-lg text-primary"></span>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 px-3 lg:px-0">
      <div v-for="(task, index) in cleaningTasks" :key="task.id" 
           class="bg-base-100 border border-base-300 rounded-[2.5rem] p-6 lg:p-8 shadow-sm transition-all"
           :class="{'opacity-60': task.is_done}">
        
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          <div class="flex-grow w-full">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-black text-base-content">{{ task.title }}</h2>
              <div class="flex gap-2">
                <button @click="openEditModal(task)" class="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center text-base-content/70 hover:bg-base-300 hover:border-primary/30 hover:text-primary transition-all active:scale-95 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button @click="removeTask(task.id)" class="w-10 h-10 rounded-xl bg-base-200 border border-base-300 flex items-center justify-center text-error/60 hover:bg-error/10 hover:border-error/30 hover:text-error transition-all active:scale-95 shadow-sm disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div v-for="(subtask, stIndex) in task.description" :key="stIndex" 
                   @click="toggleSubtask(task, stIndex)"
                   class="flex items-center gap-3 p-3 rounded-2xl hover:bg-base-200 cursor-pointer transition-colors border border-transparent"
                   :class="{'bg-base-200/50 border-base-300': subtask.done}">
                <div class="w-6 h-6 rounded-lg border-2 border-primary flex items-center justify-center transition-all"
                     :class="subtask.done ? 'bg-primary' : 'bg-transparent'">
                  <svg v-if="subtask.done" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <span class="text-base-content font-medium" :class="{'line-through opacity-40': subtask.done}">
                  {{ subtask.text }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4 bg-base-200/50 p-6 rounded-[2rem] w-full lg:w-72 border border-base-300/50">
            <div class="flex flex-col">
              <span class="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Zuständig</span>
              <span class="text-xl font-black text-primary">{{ getAssignedMember(index) }}</span>
            </div>
             
            <button @click="toggleMainStatus(task)" 
                    class="btn btn-block rounded-2xl border-none font-black shadow-sm"
                    :class="task.is_done ? 'btn-success text-white' : 'bg-base-300 text-base-content'">
               {{ task.is_done ? '✓ Ganzer Bereich fertig' : 'Alles erledigt' }}
             </button>
          </div>
        </div>
      </div>
    </div>

    <dialog class="modal" :class="{'modal-open': isModalOpen}">
      <div class="modal-box rounded-[2.5rem] border border-base-300 bg-base-100 max-w-xl shadow-2xl">
        <h3 class="font-black text-2xl mb-6">{{ isEditMode ? 'Bereich bearbeiten' : 'Neuer Putzbereich' }}</h3>
        
        <div class="space-y-6">
          <div class="form-control">
            <label class="label text-[10px] uppercase font-black text-base-content/40">Name des Bereichs</label>
            <input v-model="newBundle.title" type="text" placeholder="z.B. Küche" class="input input-bordered rounded-2xl w-full bg-base-200 border-base-300 focus:ring-primary" />
          </div>

          <div class="form-control">
            <label class="label text-[10px] uppercase font-black text-base-content/40">Unteraufgaben</label>
            <div class="space-y-2">
              <div v-for="(st, index) in newBundle.subtasks" :key="index" class="flex gap-2">
                <input v-model="st.text" type="text" placeholder="Aufgabe..." class="input input-bordered rounded-xl flex-grow bg-base-200 border-base-300 focus:ring-primary" />
                <button @click="removeSubtaskInput(index)" v-if="newBundle.subtasks.length > 1" class="btn btn-square btn-ghost text-error">
                  ✕
                </button>
              </div>
              <button @click="addSubtaskInput" class="btn btn-ghost btn-sm text-primary font-bold mt-2">+ Weitere Aufgabe</button>
            </div>
          </div>
        </div>

        <div class="modal-action flex flex-col gap-2 mt-8">
          <button @click="saveBundle" class="btn btn-primary rounded-2xl text-white font-bold w-full">
            {{ isEditMode ? 'Änderungen speichern' : 'Bereich erstellen' }}
          </button>
          <button @click="isModalOpen = false" class="btn btn-ghost rounded-2xl w-full">Abbrechen</button>
        </div>
      </div>
    </dialog>
  </div>
</template>
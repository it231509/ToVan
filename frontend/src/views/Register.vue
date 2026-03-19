<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import backend from '@/http';
console.log("Supabase Client:", supabase);

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const router = useRouter();

const handleRegister = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });

    if (authError) throw authError;

    await backend.post('/users/setup-profile');

    router.push('/');
  } catch (e) {
    error.value = e.message || 'Registrierung fehlgeschlagen';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-6">
    <div class="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
      <div class="text-center mb-10">
        <img src="../assets/Logo.png" class="w-16 mx-auto mb-4" alt="Logo">
        <h1 class="text-3xl font-black text-slate-800">Willkommen!</h1>
        <p class="text-slate-500 mt-2">Erstelle dein Konto für ToVan</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div class="form-control">
          <label class="label font-bold text-slate-600">E-Mail</label>
          <input v-model="email" type="email" class="input input-bordered rounded-2xl w-[100%]" required>
        </div>
        <div class="form-control">
          <label class="label font-bold text-slate-600">Passwort</label>
          <input v-model="password" type="password" class="input input-bordered rounded-2xl w-[100%]" required>
        </div>

        <div v-if="error" class="text-error text-sm font-medium text-center">{{ error }}</div>

        <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-bold h-14" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner"></span>
          Konto erstellen
        </button>
      </form>
      
      <p class="text-center mt-8 text-slate-500">
        Hast du schon ein Konto? 
        <RouterLink to="/login" class="text-primary font-bold">Login</RouterLink>
      </p>
    </div>
  </div>
</template>
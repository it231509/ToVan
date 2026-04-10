<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';
import backend from '@/http';

const email = ref('');
const password = ref('');
const loading = ref(false);
const isSuccess = ref(false); 
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

    if (authData.user && !authData.session) {
      isSuccess.value = true;
      loading.value = false;
      return; 
    }

    router.push('/');
  } catch (e) {
    loading.value = false;
    error.value = e.message || 'Registrierung fehlgeschlagen';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-3 transition-colors duration-300">
    <div class="max-w-md w-full bg-base-100 p-5 rounded-[3rem] shadow-xl border border-base-300 relative overflow-hidden">
      
      <div v-if="loading" class="absolute inset-0 bg-base-100/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
        <span class="loading loading-ring loading-lg text-primary"></span>
        <p class="mt-4 font-black text-base-content tracking-tight">Dein Profil wird erstellt...</p>
        <p class="text-xs text-base-content/50">Wir richten deinen ersten Haushalt ein.</p>
      </div>

      <div v-if="isSuccess" class="absolute inset-0 bg-base-100 z-50 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300">
        <div class="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 class="text-2xl font-black text-base-content mb-2">Postfach prüfen!</h2>
        <p class="text-base-content/60 text-sm leading-relaxed mb-8">
          Wir haben einen Bestätigungslink an <span class="font-bold text-base-content">{{ email }}</span> gesendet. 
          Bitte klicke auf den Link, um dein Konto zu aktivieren.
        </p>
        <RouterLink to="/login" class="btn btn-primary btn-block rounded-2xl text-white font-bold">
          Zum Login
        </RouterLink>
      </div>

      <div class="text-center mb-10">
        <img src="../assets/Logo.png" class="w-16 mx-auto mb-4" alt="Logo">
        <h1 class="text-3xl font-black text-base-content">Willkommen!</h1>
        <p class="text-base-content/60 mt-2">Erstelle dein Konto für ToVan</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div class="form-control mb-4">
          <input v-model="email" type="email" placeholder="E-Mail" class="input input-bordered rounded-2xl w-full bg-base-200 border-base-300 focus:border-primary" required>
        </div>
        <div class="form-control">
          <input v-model="password" type="password" placeholder="Passwort" class="input input-bordered rounded-2xl w-full bg-base-200 border-base-300 focus:border-primary" required>
        </div>

        <div v-if="error" class="text-error text-sm font-medium text-center bg-error/10 py-2 rounded-xl border border-error/20">
            {{ error }}
        </div>

        <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-bold shadow-lg">
          Konto erstellen
        </button>
      </form>
      
      <p class="text-center mt-8 text-base-content/50">
        Hast du schon ein Konto? 
        <RouterLink to="/login" class="text-primary font-bold">Login</RouterLink>
      </p>
    </div>
  </div>
</template>
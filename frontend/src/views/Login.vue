<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '@/supabase';

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(null);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (authError) throw authError;
    router.push('/');
  } catch (e) {
    error.value = 'E-Mail oder Passwort falsch';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-6">
    <div class="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-black text-slate-800">Schön, dass du da bist!</h1>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="form-control">
          <label class="label font-bold text-slate-600">E-Mail</label>
          <input v-model="email" type="email" class="input input-bordered w-full rounded-2xl" required>
        </div>
        <div class="form-control">
          <label class="label font-bold text-slate-600">Passwort</label>
          <input v-model="password" type="password" class="input input-bordered w-full rounded-2xl" required>
        </div>
        
        <button type="submit" class="btn btn-primary w-full rounded-2xl text-white font-bold h-14" :disabled="loading">
          Login
        </button>
      </form>
      <p class="text-center mt-8 text-slate-500">
        Neu hier? <RouterLink to="/register" class="text-primary font-bold">Registrieren</RouterLink>
      </p>
    </div>
  </div>
</template>
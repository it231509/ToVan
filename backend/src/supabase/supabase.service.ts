import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL oder Key fehlen in der .env Datei!');
  }

  this.supabase = createClient(url, key);
}

  get client() {
    return this.supabase;
  }
}
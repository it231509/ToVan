import axios from 'axios';
import { supabase } from '@/supabase';

const backend = axios.create({
  baseURL: 'https://se231326-10988.node.fhstp.cc/',
  /*baseURL: 'http://localhost:3000/',*/
  timeout: 10000,
});

backend.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  const activeHouseholdId = localStorage.getItem('active_household_id');
  if (activeHouseholdId) {
    config.headers['x-household-id'] = activeHouseholdId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- User & Household Endpoints ---
export const getMyHouseholds = async () => {
  try {
    const result = await backend.get('users/my-households');
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Fehler beim Laden deiner Haushalte');
  }
};

export const getHouseholdDetails = async () => {
  try {
    const result = await backend.get('users/household');
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Haushalt konnte nicht geladen werden');
  }
};

export const updateHouseholdName = async (name) => {
  try {
    const result = await backend.patch('users/household/name', { name });
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Name konnte nicht geändert werden');
  }
};

export const inviteUserToHousehold = async (email) => {
  try {
    const result = await backend.post('users/invite', { email });
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'User konnte nicht eingeladen werden');
  }
};

// --- Recipe Endpoints ---
export const getAllRecipes = async () => {
  try {
    const result = await backend.get('recipes');
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Fehler beim Laden der Rezepte');
  }
};

export const getRecipeById = async (id) => {
  try {
    const result = await backend.get(`recipes/${id}`);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Rezept nicht gefunden');
  }
};

export const createRecipe = async (item) => {
  try {
    const result = await backend.post('recipes', item);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Rezept konnte nicht erstellt werden');
  }
};

// --- Shoppinglist Endpoints ---
export const getShoppingList = async () => {
  try {
    const result = await backend.get('shopping-list');
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Fehler beim Laden der Einkaufsliste');
  }
};

export const addItemToShoppingList = async (item) => {
  try {
    const result = await backend.post('shopping-list', item);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Item konnte nicht hinzugefügt werden');
  }
};

export const toggleShoppingListItem = async (id, isChecked) => {
  try {
    const result = await backend.patch(`shopping-list/${id}/toggle`, { is_checked: isChecked });
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Status konnte nicht aktualisiert werden');
  }
};

export const removeShoppingListItem = async (id) => {
  try {
    const result = await backend.delete(`shopping-list/${id}`);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Item konnte nicht gelöscht werden');
  }
};

export const clearCheckedItems = async () => {
  try {
    const result = await backend.delete('shopping-list/actions/clear-checked');
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Fehler beim Bereinigen der Liste');
  }
};

export const generateShoppingListFromMealPlan = async (startDate, endDate) => {
  try {
    const result = await backend.post('shopping-list/generate', { 
      start: startDate, 
      end: endDate 
    });
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Liste konnte nicht generiert werden');
  }
};

// --- Meal Plan Endpoints ---
export const getMealPlan = async (startDate, endDate) => {
  try {
    const result = await backend.get('meal-plan', {
      params: { start: startDate, end: endDate }
    });
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Fehler beim Laden des Wochenplans');
  }
};

export const addMealToPlan = async (meal) => {
  try {
    const result = await backend.post('meal-plan', meal);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Mahlzeit konnte nicht geplant werden');
  }
};

export const updateMealInPlan = async (id, updateData) => {
  try {
    const result = await backend.put(`meal-plan/${id}`, updateData);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Update fehlgeschlagen');
  }
};

export const removeMealFromPlan = async (id) => {
  try {
    const result = await backend.delete(`meal-plan/${id}`);
    return result.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || 'Mahlzeit konnte nicht entfernt werden');
  }
};

export default backend;
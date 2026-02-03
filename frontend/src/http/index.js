import axios from 'axios';

const backend = axios.create({
  baseURL: '/api/',
  timeout: 10000,
});

// Recipe Endpoints
export const getAllRecipes = async () => {
  try {
    const result = await backend.get('recipes');
    return result.data;
  } catch (e) {
    throw new Error(e.response.data.message);
  }
};

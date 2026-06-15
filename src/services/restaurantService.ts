import supabase from './api';
import { popularRestaurants } from '../constants/mockData';

export interface Restaurant {
  _id: string;
  name: string;
  address: string;
  coverImage?: string;
  cuisine?: string[];
  rating?: number;
  isActive?: boolean;
}

const mapMockRestaurant = (res: any) => ({
  _id: res.id,
  name: res.name,
  coverImage: res.image,
  rating: Number(res.rating) || 4.5,
  deliveryTime: res.time || '30-40 min',
  discountText: res.discount,
  categories: res.cuisine ? res.cuisine.split(',').map((c: string) => c.trim()) : [],
  address: res.address || 'Hyderabad, India',
  isActive: true,
});

export const restaurantService = {
  async getRestaurants() {
    try {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error || !data || data.length === 0) {
        return popularRestaurants.map(mapMockRestaurant);
      }
      return data;
    } catch (err) {
      return popularRestaurants.map(mapMockRestaurant);
    }
  },

  async getRestaurantById(id: string) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('_id', id)
        .single();
      if (error || !data) {
        const found = popularRestaurants.find(r => r.id === id);
        return found ? mapMockRestaurant(found) : mapMockRestaurant(popularRestaurants[0]);
      }
      return data;
    } catch (err) {
      const found = popularRestaurants.find(r => r.id === id);
      return found ? mapMockRestaurant(found) : mapMockRestaurant(popularRestaurants[0]);
    }
  },
};

export default restaurantService;

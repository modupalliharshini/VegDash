import supabase from './api';
import { mockDishes } from '../constants/mockData';

export interface FoodItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  restaurantId: string;
  image?: string;
  description?: string;
  isAvailable?: boolean;
}

const mapMockDish = (dish: any) => ({
  _id: String(dish.id),
  name: dish.name,
  price: dish.price,
  category: dish.category,
  restaurantId: dish.restaurantId,
  restaurant: dish.restaurantId,
  image: dish.image,
  description: dish.description || '',
  isAvailable: dish.isAvailable ?? true,
  cookingTime: dish.cookingTime || 30,
  weight: dish.weight || '300g',
  rating: dish.rating || 4.5,
  isPopular: dish.isPopular || false,
  isRecommended: dish.isRecommended || false,
  ingredients: dish.ingredients || [],
});

export const foodService = {
  async getFoodByRestaurant(restaurantId: string) {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('restaurant', restaurantId);
      if (error || !data || data.length === 0) {
        return mockDishes.filter(d => d.restaurantId === restaurantId).map(mapMockDish);
      }
      return (data || []).map(item => ({
        ...item,
        restaurantId: item.restaurant
      }));
    } catch (err) {
      return mockDishes.filter(d => d.restaurantId === restaurantId).map(mapMockDish);
    }
  },

  async getFoodItemById(id: string | number) {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('_id', String(id))
        .single();
      if (error || !data) {
        const found = mockDishes.find(d => String(d.id) === String(id));
        return found ? mapMockDish(found) : mapMockDish(mockDishes[0]);
      }
      return {
        ...data,
        restaurantId: data.restaurant
      };
    } catch (err) {
      const found = mockDishes.find(d => String(d.id) === String(id));
      return found ? mapMockDish(found) : mapMockDish(mockDishes[0]);
    }
  },
};

export default foodService;

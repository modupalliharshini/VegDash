import supabase from './api';
import { popularRestaurants, mockDishes } from '../constants/mockData';

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
  isOpen: true,
});

const mapMockDish = (dish: any) => ({
  _id: String(dish.id),
  id: dish.id,
  name: dish.name,
  price: dish.price,
  category: dish.category,
  restaurantId: dish.restaurantId,
  restaurant: popularRestaurants.find(r => r.id === dish.restaurantId) ? mapMockRestaurant(popularRestaurants.find(r => r.id === dish.restaurantId)) : dish.restaurantId,
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

export const searchService = {
  async search(query: string, type: 'all' | 'restaurant' | 'food' = 'all') {
    try {
      let restaurants: any[] = [];
      let foodItems: any[] = [];

      const normalizedQuery = `%${query.trim()}%`;

      if (type === 'all' || type === 'restaurant') {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .or(`name.ilike.${normalizedQuery},description.ilike.${normalizedQuery},address.ilike.${normalizedQuery},categories::text.ilike.${normalizedQuery}`)
          .limit(20);

        if (!error && data && data.length > 0) {
          restaurants = data;
        } else {
          const lowerQuery = query.toLowerCase().trim();
          restaurants = popularRestaurants.filter(r => 
            r.name.toLowerCase().includes(lowerQuery) || 
            (r.cuisine && r.cuisine.toLowerCase().includes(lowerQuery))
          ).map(mapMockRestaurant);
        }
      }

      if (type === 'all' || type === 'food') {
        const { data, error } = await supabase
          .from('food_items')
          .select('*')
          .eq('isAvailable', true)
          .or(`name.ilike.${normalizedQuery},description.ilike.${normalizedQuery},category.ilike.${normalizedQuery}`)
          .limit(30);

        if (!error && data && data.length > 0) {
          const restaurantIds = [...new Set(data.map(item => item.restaurant))];
          const { data: dbRestaurants } = await supabase
            .from('restaurants')
            .select('*')
            .in('_id', restaurantIds);

          foodItems = data.map(item => ({
            ...item,
            restaurantId: item.restaurant,
            restaurant: dbRestaurants?.find(r => r._id === item.restaurant) || item.restaurant
          }));
        } else {
          const lowerQuery = query.toLowerCase().trim();
          foodItems = mockDishes.filter(d => 
            d.name.toLowerCase().includes(lowerQuery) || 
            (d.description && d.description.toLowerCase().includes(lowerQuery)) ||
            d.category.toLowerCase().includes(lowerQuery)
          ).map(mapMockDish);
        }
      }

      return {
        restaurants,
        foodItems,
      };
    } catch (err) {
      const lowerQuery = query.toLowerCase().trim();
      const restaurants = popularRestaurants.filter(r => 
        r.name.toLowerCase().includes(lowerQuery) || 
        (r.cuisine && r.cuisine.toLowerCase().includes(lowerQuery))
      ).map(mapMockRestaurant);

      const foodItems = mockDishes.filter(d => 
        d.name.toLowerCase().includes(lowerQuery) || 
        (d.description && d.description.toLowerCase().includes(lowerQuery)) ||
        d.category.toLowerCase().includes(lowerQuery)
      ).map(mapMockDish);

      return {
        restaurants,
        foodItems,
      };
    }
  },

  async getTrending() {
    const categories = [
      'Pure Vegetarian Restaurants',
      'Jain Food',
      'Satvik Meals',
      'Healthy Foods',
      'Organic Food Partners',
      'Temple Prasadam Deliveries',
    ];

    try {
      const { data: topRestaurants, error: resErr } = await supabase
        .from('restaurants')
        .select('*')
        .eq('isOpen', true)
        .order('rating', { ascending: false })
        .limit(10);

      const { data: popularItemsRaw, error: foodErr } = await supabase
        .from('food_items')
        .select('*')
        .eq('isAvailable', true)
        .order('createdAt', { ascending: false })
        .limit(20);

      let restaurantsList = topRestaurants || [];
      let popularItemsList = [];

      if (!resErr && topRestaurants && topRestaurants.length > 0) {
        restaurantsList = topRestaurants;
      } else {
        restaurantsList = popularRestaurants.map(mapMockRestaurant);
      }

      if (!foodErr && popularItemsRaw && popularItemsRaw.length > 0) {
        const restaurantIds = [...new Set((popularItemsRaw || []).map(item => item.restaurant))];
        const { data: dbRestaurants } = await supabase
          .from('restaurants')
          .select('*')
          .in('_id', restaurantIds);

        popularItemsList = (popularItemsRaw || []).map(item => ({
          ...item,
          restaurantId: item.restaurant,
          restaurant: dbRestaurants?.find(r => r._id === item.restaurant) || item.restaurant
        }));
      } else {
        popularItemsList = mockDishes.map(mapMockDish);
      }

      return {
        topRestaurants: restaurantsList,
        popularItems: popularItemsList,
        categories,
      };
    } catch (err) {
      return {
        topRestaurants: popularRestaurants.map(mapMockRestaurant),
        popularItems: mockDishes.map(mapMockDish),
        categories,
      };
    }
  },
};

export default searchService;

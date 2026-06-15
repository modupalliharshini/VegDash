import {useState, useEffect} from 'react';
import {mockDishes} from '@/constants/mockData';
import {DishType} from '@/types';

export const useGetDish = (id: number) => {
  const [dish, setDish] = useState<DishType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const foundDish = mockDishes.find((d) => d.id === id);
    setDish(foundDish || null);
    setIsLoading(false);
  }, [id]);

  return {
    dish,
    isLoading,
  };
};


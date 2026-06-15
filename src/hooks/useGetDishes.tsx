import {useQuery} from '@tanstack/react-query';
import {mockDishes} from '@/constants/mockData';

export const useGetDishes = () => {
  const getDishes = async () => {
    return mockDishes;
  };

  const queryResult = useQuery({
    queryKey: ['dishes'],
    queryFn: getDishes,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return queryResult;
};


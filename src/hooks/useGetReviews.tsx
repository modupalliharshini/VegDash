import {useQuery} from '@tanstack/react-query';
import {mockReviews} from '@/constants/mockData';

export const useGetReviews = () => {
  const getReviews = async () => {
    return mockReviews;
  };

  const queryResult = useQuery({
    queryKey: ['reviews'],
    queryFn: getReviews,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return queryResult;
};

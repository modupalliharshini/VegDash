import {useQuery} from '@tanstack/react-query';
import {mockPromocodes} from '@/constants/mockData';

export const useGetPromocodes = () => {
  const getPromocodes = async () => {
    return mockPromocodes;
  };

  return useQuery({
    queryKey: ['promocodes'],
    queryFn: getPromocodes,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};

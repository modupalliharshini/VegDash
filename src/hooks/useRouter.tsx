import { useContext } from 'react';
import { useNavigation, NavigationRouteContext, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const useRouter = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useContext(NavigationRouteContext);

  const navigate = (path: string | number, options?: { replace?: boolean; state?: any }) => {
    if (path === -1 || path === 'back') {
      navigation.goBack();
    } else if (typeof path === 'string') {
      if (options?.replace) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: path, params: options?.state || {} }],
          }),
        );
      } else {
        navigation.navigate(path as any, (options?.state || {}) as any);
      }
    }
  };

  return {
    navigate,
    location: { pathname: route?.name || '' },
    params: route?.params || {},
  };
};

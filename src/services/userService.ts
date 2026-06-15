import supabase from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

interface Address extends AddressPayload {
  _id: string;
}

export const userService = {
  async getAddresses() {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        const { data, error } = await supabase
          .from('users')
          .select('addresses')
          .eq('_id', user.id)
          .single();
        if (!error && data) return data.addresses || [];
      }
    } catch (_) {}

    const stored = await AsyncStorage.getItem('vegdash_local_user');
    if (stored) {
      const u = JSON.parse(stored);
      return u.addresses || [];
    }
    return [];
  },

  async addAddress(payload: AddressPayload) {
    let currentProfile: any = null;
    const stored = await AsyncStorage.getItem('vegdash_local_user');
    if (stored) {
      currentProfile = JSON.parse(stored);
    }

    const addresses: Address[] = currentProfile?.addresses || [];
    const newAddress: Address = {
      _id: Math.random().toString(36).substring(2, 11),
      ...payload,
      isDefault: payload.isDefault ?? (addresses.length === 0)
    };

    if (newAddress.isDefault) {
      addresses.forEach(a => a.isDefault = false);
    }

    const updatedAddresses = [...addresses, newAddress];
    if (currentProfile) {
      currentProfile.addresses = updatedAddresses;
      await AsyncStorage.setItem('vegdash_local_user', JSON.stringify(currentProfile));
    }

    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        await supabase
          .from('users')
          .update({ addresses: updatedAddresses })
          .eq('_id', user.id);
      }
    } catch (_) {}

    return updatedAddresses;
  },

  async updateAddress(addressId: string, payload: Partial<AddressPayload>) {
    let currentProfile: any = null;
    const stored = await AsyncStorage.getItem('vegdash_local_user');
    if (stored) {
      currentProfile = JSON.parse(stored);
    }

    const addresses: Address[] = currentProfile?.addresses || [];
    const isSettingDefault = payload.isDefault === true;

    const updatedAddresses = addresses.map(addr => {
      if (addr._id === addressId) {
        return { ...addr, ...payload };
      }
      return isSettingDefault ? { ...addr, isDefault: false } : addr;
    });

    if (currentProfile) {
      currentProfile.addresses = updatedAddresses;
      await AsyncStorage.setItem('vegdash_local_user', JSON.stringify(currentProfile));
    }

    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        await supabase
          .from('users')
          .update({ addresses: updatedAddresses })
          .eq('_id', user.id);
      }
    } catch (_) {}

    return updatedAddresses;
  },

  async deleteAddress(addressId: string) {
    let currentProfile: any = null;
    const stored = await AsyncStorage.getItem('vegdash_local_user');
    if (stored) {
      currentProfile = JSON.parse(stored);
    }

    const addresses: Address[] = currentProfile?.addresses || [];
    const updatedAddresses = addresses.filter(addr => addr._id !== addressId);

    if (addresses.find(a => a._id === addressId)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    if (currentProfile) {
      currentProfile.addresses = updatedAddresses;
      await AsyncStorage.setItem('vegdash_local_user', JSON.stringify(currentProfile));
    }

    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        await supabase
          .from('users')
          .update({ addresses: updatedAddresses })
          .eq('_id', user.id);
      }
    } catch (_) {}

    return updatedAddresses;
  },

  async setDefaultAddress(addressId: string) {
    let currentProfile: any = null;
    const stored = await AsyncStorage.getItem('vegdash_local_user');
    if (stored) {
      currentProfile = JSON.parse(stored);
    }

    const addresses: Address[] = currentProfile?.addresses || [];
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr._id === addressId
    }));

    if (currentProfile) {
      currentProfile.addresses = updatedAddresses;
      await AsyncStorage.setItem('vegdash_local_user', JSON.stringify(currentProfile));
    }

    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        await supabase
          .from('users')
          .update({ addresses: updatedAddresses })
          .eq('_id', user.id);
      }
    } catch (_) {}

    return updatedAddresses;
  },
};

export default userService;

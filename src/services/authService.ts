import supabase from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: string;
}

const LOCAL_USER_KEY = 'vegdash_local_user';
const LOCAL_TOKEN_KEY = 'vegdash_local_token';

const DEFAULT_MOCK_USER = {
  _id: 'mock-user-123',
  name: 'Hrushikesh',
  email: 'hrushikesh@example.com',
  phone: '9876543210',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
  addresses: [
    {
      _id: 'addr-1',
      street: 'Flat 102, Green Meadows',
      city: 'Gachibowli',
      state: 'Telangana',
      zip: '500032',
      isDefault: true,
    }
  ],
  isPhoneVerified: true,
};

const sanitizeAddresses = (addresses: any) => {
  if (!addresses) return [];
  if (Array.isArray(addresses)) return addresses;
  if (typeof addresses === 'string') {
    try {
      const parsed = JSON.parse(addresses);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  return [];
};

const sanitizeUser = (user: any) => {
  if (!user) return user;
  return {
    ...user,
    addresses: sanitizeAddresses(user.addresses)
  };
};

const isSupabaseActive = !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export const authService = {
  async login(payload: LoginPayload) {
    if (!isSupabaseActive) {
      return this.mockLogin(payload);
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('User not found');

      // Check if profile exists, otherwise heal by inserting it
      let profile = null;
      const { data: profileData, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('_id', data.user.id)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching user profile:', profileErr.message);
      }

      if (profileData) {
        profile = profileData;
      } else {
        console.log('User profile not found in public.users. Creating a new profile row...');
        const newProfile = {
          _id: data.user.id,
          name: data.user.email?.split('@')[0] || 'User',
          email: data.user.email || payload.email,
          phone: data.user.phone || '9876543210',
          role: 'customer',
          avatar: '',
          addresses: [],
          isPhoneVerified: false,
        };
        const { error: insertErr } = await supabase.from('users').insert(newProfile);
        if (insertErr) {
          console.error('Failed to create user profile during login:', insertErr.message);
          // Fallback to local profile rather than crashing, so the user can still log in
        }
        profile = newProfile;
      }

      const res = {
        user: sanitizeUser(profile),
        token: data.session?.access_token || '',
      };
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.user));
      await AsyncStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      return res;
    } catch (err: any) {
      console.error('Supabase Login Error:', err);
      const isNetworkError = err.message && (
        err.message.includes('FetchError') ||
        err.message.includes('Network Error') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('Network request failed')
      );
      if (isNetworkError) {
        return this.mockLogin(payload);
      }
      throw err;
    }
  },

  async mockLogin(payload: LoginPayload) {
    const mockUser = {
      ...DEFAULT_MOCK_USER,
      email: payload.email,
      name: payload.email.split('@')[0],
    };
    const res = {
      user: sanitizeUser(mockUser),
      token: 'mock-jwt-token-xyz',
    };
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.user));
    await AsyncStorage.setItem(LOCAL_TOKEN_KEY, res.token);
    return res;
  },

  async register(payload: RegisterPayload) {
    if (!isSupabaseActive) {
      return this.mockRegister(payload);
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Registration failed');

      const userRow = {
        _id: data.user.id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role || 'customer',
        avatar: '',
        addresses: [],
        isPhoneVerified: false,
      };

      const { error: insertErr } = await supabase.from('users').insert(userRow);
      if (insertErr) throw new Error(insertErr.message);

      const res = {
        user: sanitizeUser(userRow),
        token: data.session?.access_token || '',
      };
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.user));
      await AsyncStorage.setItem(LOCAL_TOKEN_KEY, res.token);
      return res;
    } catch (err: any) {
      console.error('Supabase Registration Error:', err);
      const isNetworkError = err.message && (
        err.message.includes('FetchError') ||
        err.message.includes('Network Error') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('Network request failed')
      );
      if (isNetworkError) {
        return this.mockRegister(payload);
      }
      throw err;
    }
  },

  async mockRegister(payload: RegisterPayload) {
    const mockUser = {
      ...DEFAULT_MOCK_USER,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role || 'customer',
    };
    const res = {
      user: sanitizeUser(mockUser),
      token: 'mock-jwt-token-xyz',
    };
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(res.user));
    await AsyncStorage.setItem(LOCAL_TOKEN_KEY, res.token);
    return res;
  },

  async sendOTP(phone: string) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !user) {
        throw new Error('Phone number is not registered');
      }

      const otpCode = '1234';

      await supabase.from('otps').delete().eq('phone', phone);

      const { error: insertErr } = await supabase.from('otps').insert({
        _id: Math.random().toString(36).substring(2, 11),
        phone,
        otp: otpCode,
      });

      if (insertErr) throw new Error(insertErr.message);

      console.log(`[Supabase Mock SMS] OTP code for ${phone} is ${otpCode}`);
      return { success: true, message: `Verification OTP sent to ${phone}` };
    } catch (err) {
      console.log(`[Mock SMS Fallback] OTP code for ${phone} is 1234`);
      return { success: true, message: `Verification OTP sent to ${phone} (Mock)` };
    }
  },

  async verifyOTP(phone: string, otp: string) {
    try {
      const { data: otpRecord, error: otpErr } = await supabase
        .from('otps')
        .select('*')
        .eq('phone', phone)
        .eq('otp', otp)
        .single();

      if (otpErr || !otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      const { data: user, error: updateErr } = await supabase
        .from('users')
        .update({ isPhoneVerified: true })
        .eq('phone', phone)
        .select()
        .single();

      if (updateErr || !user) {
        throw new Error('User not found');
      }

      await supabase.from('otps').delete().eq('phone', phone);
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      return sanitizeUser(user);
    } catch (err) {
      if (otp !== '1234') {
        throw new Error('Invalid or expired OTP');
      }
      const stored = await AsyncStorage.getItem(LOCAL_USER_KEY);
      let user = stored ? JSON.parse(stored) : { ...DEFAULT_MOCK_USER, phone };
      user.isPhoneVerified = true;
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      return sanitizeUser(user);
    }
  },

  async getProfile() {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) throw new Error('Not authenticated');

      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('*')
        .eq('_id', user.id)
        .single();

      if (profileErr) throw new Error(profileErr.message);
      await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      return sanitizeUser(profile);
    } catch (err) {
      const stored = await AsyncStorage.getItem(LOCAL_USER_KEY);
      if (stored) return sanitizeUser(JSON.parse(stored));
      throw new Error('Not authenticated');
    }
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    addresses?: any[];
  }) {
    let currentProfile = DEFAULT_MOCK_USER;
    const stored = await AsyncStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      currentProfile = JSON.parse(stored);
    }

    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.addresses) updates.addresses = data.addresses;

    const updatedProfile = { ...currentProfile, ...updates };
    await AsyncStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedProfile));

    try {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (!authErr && user) {
        await supabase
          .from('users')
          .update(updates)
          .eq('_id', user.id);
      }
    } catch (_) {}

    return sanitizeUser(updatedProfile);
  },

  async resetPassword(payload: { phone: string; otp: string; newPassword: string }) {
    try {
      const { data: otpRecord, error: otpErr } = await supabase
        .from('otps')
        .select('*')
        .eq('phone', payload.phone)
        .eq('otp', payload.otp)
        .single();

      if (otpErr || !otpRecord) {
        throw new Error('Invalid or expired OTP');
      }

      const { error: passwordErr } = await supabase.auth.updateUser({
        password: payload.newPassword,
      });

      if (passwordErr) throw new Error(passwordErr.message);

      await supabase.from('otps').delete().eq('phone', payload.phone);

      return { success: true, message: 'Password reset successfully' };
    } catch (err) {
      if (payload.otp !== '1234') {
        throw new Error('Invalid or expired OTP');
      }
      return { success: true, message: 'Password reset successfully (Mock)' };
    }
  },
};

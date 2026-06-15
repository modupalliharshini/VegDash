import { useState } from 'react';

export const useFormField = <T extends Record<string, any>>(initialForm: T) => {
  const [form, setForm] = useState<T>(initialForm);

  const onChangeText = (field: keyof T, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value as any }));
  };

  return {
    form,
    setForm,
    onChangeText,
  };
};

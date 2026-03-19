'use client';

import React from 'react';
import { UseFormReturn, FormProvider, FieldValues, SubmitHandler } from 'react-hook-form';

export interface IzFormProps<TFieldValues extends FieldValues> {
  /** Form instance trả về từ `useForm()` */
  form: UseFormReturn<TFieldValues>;
  /** Hàm Submit chuẩn của React Hook Form (Tự auto trigger Validate -> OnSubmit) */
  onSubmit: SubmitHandler<TFieldValues>;
  children: React.ReactNode;
  /** Chỉnh sửa layout form tổng ngoài lớp form */
  className?: string;
  /** Nếu Form có input type file, form action tự biến thành multipart/form-data. Ở NextJs RHF k bị ép nên ko lo. */
}

/**
 * IzForm
 * Vỏ bọc hệ thống. Bơm Context (FormProvider) xuống cho các IzFormInput bên dưới nói chuyện được với nhau.
 */
export function IzForm<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: IzFormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className={className}
        noValidate // Chặn trình duyệt hiển thị popup đỏ mặc định khó chịu, để Zod/RHF lo.
      >
        {children}
      </form>
    </FormProvider>
  );
}

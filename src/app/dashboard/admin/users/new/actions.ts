// src/app/dashboard/admin/users/new/actions.ts
'use server';

import { z } from 'zod';
import { userSchema } from '@/lib/validation';
import { createUser as createUserService } from '@/lib/supabase/service';

export async function createUser(data: z.infer<typeof userSchema>) {
  try {
    await createUserService(data);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

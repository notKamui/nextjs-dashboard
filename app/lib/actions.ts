'use server';

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    required_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Amount must be greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a valid invoice status.',
  }),
  date: z.date(),
})

const CreateInvoice = FormSchema.pick({
  customerId: true,
  amount: true,
  status: true,
})

const UpdateInvoice = FormSchema.pick({
  customerId: true,
  amount: true,
  status: true,
})

export type State = {
  errors?: {
    customerId?: string[],
    amount?: string[],
    status?: string[],
  },
  message?: string | null,
}

export async function createInvoice(prevState: State, formData: FormData) {
  const fields = CreateInvoice.safeParse(Object.fromEntries(formData.entries()));
  if (!fields.success) return {
    errors: fields.error.flatten().fieldErrors,
    message: 'Failed to create invoice.',
  }

  const {
    customerId,
    amount,
    status,
  } = fields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to create invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const fields = UpdateInvoice.safeParse(Object.fromEntries(formData.entries()));
  if (!fields.success) return {
    errors: fields.error.flatten().fieldErrors,
    message: 'Failed to update invoice.',
  }

  const {
    customerId,
    amount,
    status,
  } = fields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId},
            amount      = ${amountInCents},
            status      = ${status}
        WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to update invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`
        DELETE
        FROM invoices
        WHERE id = ${id}
    `;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted invoice.' }
  } catch (error) {
    return { message: 'Database Error: Failed to delete invoice.' };
  }
}

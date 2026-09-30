'use server';

import { Prisma } from '@/generated/prisma/client';
import { getPrisma } from '@/lib/prisma';
import { addEmailSchema, MAX_EMAILS } from '@/lib/validation';

// TODO(M4): gate every action here on the session cookie. Until login exists,
// these endpoints are callable by anyone who can reach the deployment.

export type RecoveryEmailRow = { id: string; email: string };

export type AddEmailResult = { ok: true; email: RecoveryEmailRow } | { ok: false; error: string };

export type RemoveEmailResult = { ok: true } | { ok: false; error: string };

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function addRecipientEmail(input: unknown): Promise<AddEmailResult> {
  // Re-validate server-side: a server action is an open endpoint, not a form.
  const parsed = addEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  try {
    const prisma = getPrisma();

    // Cap checked in the database's world, not the client's — the button being
    // disabled is UX, this is the rule.
    const count = await prisma.recipientEmail.count();
    if (count >= MAX_EMAILS) {
      return { ok: false, error: `Limit reached — ${MAX_EMAILS} addresses max.` };
    }

    const created = await prisma.recipientEmail.create({
      data: { email: parsed.data.email },
      select: { id: true, email: true },
    });

    return { ok: true, email: created };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: 'Already on the list.' };
    }

    console.error('addRecipientEmail failed', error);
    return { ok: false, error: 'Could not save the address. Try again.' };
  }
}

export async function removeRecipientEmail(id: string): Promise<RemoveEmailResult> {
  try {
    await getPrisma().recipientEmail.delete({ where: { id } });

    return { ok: true };
  } catch (error) {
    // P2025 = record not found — already gone, which is the goal state.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { ok: true };
    }

    console.error('removeRecipientEmail failed', error);
    return { ok: false, error: 'Could not remove the address. Try again.' };
  }
}

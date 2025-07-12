import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';

export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = addMinutes(new Date(), 15); // expires in 15 mins

  await prisma.verificationtoken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return { token, expires };
}

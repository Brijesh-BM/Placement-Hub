import { db } from './src/lib/db';

async function test() {
  try {
    const user = await db.user.findFirst({
      where: { email: 'student@placementhub.com' },
      include: {
        profile: {
          include: {
            onboardingProfile: true,
            readinessScore: true
          }
        }
      }
    });
    console.log('Query Succeeded:', JSON.stringify(user, null, 2));
  } catch (e: any) {
    console.error('Query Failed:', e.message);
  }
}

test();

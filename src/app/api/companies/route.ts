import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const companyWeights: Record<string, Record<string, number>> = {
  amazon: { dsaScore: 0.5, oopScore: 0.15, dbmsScore: 0.15, osScore: 0.1, interviewScore: 0.1 },
  google: { dsaScore: 0.7, osScore: 0.15, cnScore: 0.05, interviewScore: 0.1 },
  microsoft: { dsaScore: 0.5, oopScore: 0.15, dbmsScore: 0.15, osScore: 0.1, interviewScore: 0.1 },
  ibm: { dsaScore: 0.3, oopScore: 0.25, dbmsScore: 0.15, osScore: 0.15, cnScore: 0.15 },
  tcs: { aptitudeScore: 0.3, reasoningScore: 0.3, verbalScore: 0.2, dsaScore: 0.1, dbmsScore: 0.1 },
  infosys: { aptitudeScore: 0.35, reasoningScore: 0.35, verbalScore: 0.15, dsaScore: 0.075, oopScore: 0.075 },
  accenture: { aptitudeScore: 0.25, reasoningScore: 0.25, verbalScore: 0.2, oopScore: 0.2, interviewScore: 0.1 },
  capgemini: { aptitudeScore: 0.3, reasoningScore: 0.3, verbalScore: 0.2, oopScore: 0.2 },
  cognizant: { aptitudeScore: 0.25, reasoningScore: 0.25, verbalScore: 0.25, oopScore: 0.25 },
  deloitte: { aptitudeScore: 0.2, reasoningScore: 0.2, verbalScore: 0.2, dbmsScore: 0.4 }
};

export async function GET() {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { userId: userPayload.userId },
      include: { readinessScore: true }
    });

    const studentScore = profile?.readinessScore;

    const companies = await db.company.findMany({
      include: {
        tests: { select: { id: true, title: true } }
      },
      orderBy: { name: 'asc' },
    });

    const companiesWithReadiness = companies.map(c => {
      const compName = c.name.toLowerCase();
      const weights = companyWeights[compName] || companyWeights.amazon;
      
      let weightedScore = 0;
      let totalWeight = 0;
      
      if (studentScore) {
        for (const [key, weight] of Object.entries(weights)) {
          const val = (studentScore as any)[key] || 60.0;
          weightedScore += val * weight;
          totalWeight += weight;
        }
      }

      const readiness = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 60;

      // Add other details like difficulty and estimated package dynamically
      let diff = 'Medium';
      let pack = '4.5 - 9.5 LPA';
      if (['amazon', 'google', 'microsoft'].includes(compName)) {
        diff = 'Hard';
        pack = compName === 'google' ? '18 - 55 LPA' : (compName === 'microsoft' ? '15 - 45 LPA' : '12 - 40 LPA');
      } else if (['tcs', 'infosys'].includes(compName)) {
        diff = 'Easy';
        pack = compName === 'tcs' ? '3.3 - 7.5 LPA' : '3.6 - 8.0 LPA';
      } else {
        pack = compName === 'deloitte' ? '6.0 - 12.0 LPA' : (compName === 'ibm' ? '7.0 - 18.0 LPA' : '4.0 - 8.5 LPA');
      }

      return {
        ...c,
        difficulty: diff,
        packageRange: pack,
        readinessScore: readiness
      };
    });

    return NextResponse.json({ companies: companiesWithReadiness });
  } catch (error: any) {
    console.error('GET companies error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

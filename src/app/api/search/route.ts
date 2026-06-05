import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userPayload = await getCurrentUser();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({
        results: {
          questions: [],
          tests: [],
          roadmaps: [],
          companies: [],
          experiences: [],
          notes: [],
          pyqs: [],
          jobs: [],
          rounds: [],
        }
      });
    }

    const keyword = query.trim();

    // 1. Fetch matching Questions
    const questions = await db.question.findMany({
      where: { text: { contains: keyword } },
      select: { id: true, text: true, difficulty: true, subCategory: { select: { name: true } } },
      take: 5
    });

    // 2. Fetch matching Tests
    const tests = await db.test.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      },
      select: { id: true, title: true, duration: true },
      take: 5
    });

    // 3. Fetch matching Roadmaps
    const roadmaps = await db.roadmap.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      },
      select: { id: true, title: true, description: true },
      take: 5
    });

    // 4. Fetch matching Companies
    const companies = await db.company.findMany({
      where: { name: { contains: keyword } },
      select: { id: true, name: true },
      take: 5
    });

    // 5. Fetch matching Experiences
    const experiences = await db.interviewExperience.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { role: { contains: keyword } },
          { questionsAsked: { contains: keyword } },
          { experience: { contains: keyword } }
        ]
      },
      select: { id: true, company: { select: { name: true } }, role: true, upvoteCount: true },
      take: 5
    });

    // 6. Fetch matching Learning Notes
    const notes = await db.learningNote.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } }
        ]
      },
      select: { id: true, title: true, category: true },
      take: 5
    });

    // 7. Fetch matching PYQs
    const pyqs = await db.previousYearQuestion.findMany({
      where: {
        OR: [
          { question: { contains: keyword } },
          { role: { contains: keyword } },
          { topic: { contains: keyword } }
        ]
      },
      select: { id: true, company: { select: { name: true } }, year: true, role: true, topic: true },
      take: 5
    });

    // 8. Fetch matching Jobs
    const jobs = await db.recruiterJob.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { company: { contains: keyword } },
          { requiredSkills: { contains: keyword } }
        ]
      },
      select: { id: true, title: true, company: true, location: true, salary: true },
      take: 5
    });

    // 9. Fetch matching Company Rounds
    const rounds = await db.companyRound.findMany({
      where: {
        OR: [
          { roundName: { contains: keyword } },
          { description: { contains: keyword } }
        ]
      },
      include: { company: { select: { name: true } } },
      take: 5
    });

    return NextResponse.json({
      results: {
        questions,
        tests,
        roadmaps,
        companies,
        experiences,
        notes,
        pyqs,
        jobs,
        rounds,
      }
    });
  } catch (error) {
    console.error('Search API failure', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

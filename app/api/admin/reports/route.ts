import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch all reports (ordered by creation date, newest first)
export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST: Create a new report
export async function POST(req: NextRequest) {
  try {
    const { title, message } = await req.json();

    const newReport = await prisma.report.create({
      data: {
        title,
        message,
        
      },
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating report' }, { status: 400 });
  }
}

// PUT: Update an existing report
export async function PUT(req: NextRequest) {
  try {
    const { id, title, message } = await req.json();

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { title, message },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating report' }, { status: 400 });
  }
}

// DELETE: Delete a report by ID
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting report' }, { status: 400 });
  }
}

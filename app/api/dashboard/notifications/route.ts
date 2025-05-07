import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust to your Prisma client import

export async function GET(req: Request) {
  // Simulate getting the logged-in user's ID (replace with actual user ID retrieval)
  // const userId = "cmad0ew7g0004vb6crl1idr6u"; // Replace this with the logged-in user's ID

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Extract fields from the request body
    const { userId, title, message } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: "userId, title, and message are required" },
        { status: 400 }
      );
    }

    // Create the notification in the database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        read: false, // Default to unread
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

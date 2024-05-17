import { getUsers } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { clientSecret } = await req.json();
  try {
    const users = await getUsers(clientSecret);
    if (users !== null)
      return NextResponse.json({ data: users }, { status: 200 });
    return NextResponse.json({ error: users }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Error getting user" + error });
  }
}

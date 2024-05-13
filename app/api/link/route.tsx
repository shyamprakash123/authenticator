import { linkUserAndThirdPartyApp } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { authToken, clientSecret } = await req.json();
  try {
    const linkStatus = await linkUserAndThirdPartyApp(authToken, clientSecret);
    if (linkStatus !== null)
      return NextResponse.json({ data: linkStatus }, { status: 200 });
    return NextResponse.json({ error: linkStatus }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Error signing up user" + error });
  }
}

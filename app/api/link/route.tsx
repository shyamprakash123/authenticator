import { link } from "fs";
import { linkUserAndThirdPartyApp } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { authToken, clientSecret } = await req.json();
  try {
    const linkStatus = await linkUserAndThirdPartyApp(authToken, clientSecret);
    if (linkStatus.status !== 200)
      return NextResponse.json({ error: linkStatus.msg }, { status: 400 });
    return NextResponse.json(
      { msg: linkStatus.msg, userId: linkStatus.userId },
      { status: linkStatus.status }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error linking user" + error });
  }
}

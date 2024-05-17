import { verifyTwoFactorCode } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { code, userId, clientSecret } = await req.json();
  try {
    const codeStatus = await verifyTwoFactorCode(code, userId, clientSecret);
    if (codeStatus.status !== 200) {
      return NextResponse.json(
        { error: codeStatus.msg },
        { status: codeStatus.status }
      );
    } else {
      return NextResponse.json(
        { msg: codeStatus.msg },
        { status: codeStatus.status }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Error while verifying" + error });
  }
}

import { verifyTwoFactorCode } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { code, userId, clientSecret } = await req.json();
  try {
    const codeStatus = await verifyTwoFactorCode(code, userId, clientSecret);
    if (codeStatus === null) {
      return NextResponse.json(
        { error: "Error while verifying two factor codes" },
        { status: 400 }
      );
    } else {
      return NextResponse.json({ data: codeStatus }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error while verifying" + error });
  }
}

import { updateAndGetTwoFactorCodes } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { id, accountType } = await req.json();
  try {
    const codes = await updateAndGetTwoFactorCodes(id);
    if (codes === null) {
      return NextResponse.json(
        { error: "Error while creating two factor codes" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { data: codes, accountType: accountType },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Error signing up user" + error });
  }
}

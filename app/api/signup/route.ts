import type { NextApiRequest } from "next";
import { signUpUser, signUpThirdPartyApp } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { username, password, email, accountType } = await req.json();
  try {
    if (accountType === "personal") {
      const user = await signUpUser(username, password, email);
      return NextResponse.json({ data: "signup successfull" }, { status: 200 });
    } else {
      const user = await signUpThirdPartyApp(username, email, password);
      return NextResponse.json({ data: "signup successfull" }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error signing up user" + error });
  }
}

import { loginUser, loginThirdPartyApp } from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { username, password, email, accountType } = await req.json();
  try {
    if (accountType === "personal") {
      const user = await loginUser(username, password);
      if (user.status !== 200)
        return NextResponse.json({ error: user.msg }, { status: user.status });
      return NextResponse.json(
        { data: user.msg, accountType: accountType },
        { status: 200 }
      );
    } else {
      const user = await loginThirdPartyApp(email, password);
      if (user.status !== 200)
        return NextResponse.json({ error: user.msg }, { status: user.status });
      return NextResponse.json(
        { data: user.msg, accountType: accountType },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Error signing up user" + error });
  }
}

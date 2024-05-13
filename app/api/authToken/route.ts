import {
  createAuthCodeForUser,
  retrieveAuthCode,
  updateAuthCode,
} from "../../../prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: any) {
  const { id, accountType } = await req.json();
  try {
    if (accountType === "personal") {
      const authToken = await retrieveAuthCode(id);
      if (authToken !== null) {
        if (authToken.expiresAt < new Date()) {
          const user = await updateAuthCode(authToken.token);
          if (user === null)
            return NextResponse.json(
              { error: "Error while creating authToken" },
              { status: 400 }
            );
          return NextResponse.json(
            { data: user, accountType: accountType },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            { data: authToken, accountType: accountType },
            { status: 200 }
          );
        }
      }
      const user = await createAuthCodeForUser(id);
      if (user === null)
        return NextResponse.json(
          { error: "Error while creating authToken" },
          { status: 400 }
        );
      return NextResponse.json(
        { data: user, accountType: accountType },
        { status: 200 }
      );
    } else {
    }
  } catch (error) {
    return NextResponse.json({ error: "Error signing up user" + error });
  }
}

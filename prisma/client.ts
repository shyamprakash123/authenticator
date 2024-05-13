import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt");
const saltRounds = 10;
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace NodeJS {
    interface Global {}
  }
}

interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;

async function signUpUser(username: string, password: string, email: string) {
  bcrypt.hash(password, saltRounds, async function (err: any, hash: string) {
    const user = await prisma.user.create({
      data: {
        username,
        password: hash,
        email,
      },
    });
    return user;
  });
}

async function loginUser(username: string, password_field: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) return { msg: "User not found", status: 404 };
  const isPasswordValid = await bcrypt.compare(password_field, user.password);
  if (!isPasswordValid) return { msg: "Invalid password", status: 401 };
  const { password, ...otherContent } = user;
  return { msg: otherContent, status: 200 };
}

async function signUpThirdPartyApp(
  name: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const clientSecret = uuidv4();
  const thirdPartyApp = await prisma.thirdPartyApp.create({
    data: {
      name,
      email,
      password: hashedPassword,
      clientSecret,
    },
  });
  return thirdPartyApp;
}

async function loginThirdPartyApp(email: string, password_field: string) {
  const thirdPartyApp = await prisma.thirdPartyApp.findUnique({
    where: { email },
  });
  if (!thirdPartyApp) return { msg: "Third party app not found", status: 404 };
  const isPasswordValid = await bcrypt.compare(
    password_field,
    thirdPartyApp.password
  );
  if (!isPasswordValid) return { msg: "Invalid password", status: 401 };
  const { password, ...otherContent } = thirdPartyApp;
  return { msg: otherContent, status: 200 };
}

async function createAuthCodeForUser(userId: number) {
  const token = uuidv4().replace(/-/g, "").slice(0, 6);
  const authCode = await prisma.authToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return authCode;
}

async function updateAuthCode(authToken: string) {
  const updatedAuthCode = await prisma.authToken.update({
    where: { token: authToken },
    data: {
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  return updatedAuthCode;
}

async function retrieveAuthCode(userId: number) {
  try {
    const authCode = await prisma.authToken.findFirstOrThrow({
      where: { userId },
    });
    return authCode;
  } catch (err) {
    return null;
  }
}

async function linkUserAndThirdPartyApp(
  authToken: string,
  clientSecret: string
) {
  const authT = await prisma.authToken.findFirstOrThrow({
    where: { token: authToken, expiresAt: { gte: new Date() } },
  });
  if (!authT) return "Invalid or expired auth token";
  const rel = await prisma.user.findFirst({
    where: { thirdPartyApps: { some: { clientSecret } }, id: authT.userId },
  });
  if (rel) return "User already linked to this third party app";
  const appId = await prisma.thirdPartyApp.findFirst({
    where: { clientSecret },
  });
  await prisma.user.update({
    where: { id: authT.userId },
    data: {
      thirdPartyApps: { connect: { id: appId?.id } },
    },
  });
  await prisma.thirdPartyApp.update({
    where: { clientSecret },
    data: {
      users: { connect: { id: authT.userId } },
    },
  });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 1000);
  if (!appId) return "Third party app not found";
  await prisma.twoFactorCode.create({
    data: {
      code,
      userId: authT.userId,
      thirdPartyAppId: appId?.id,
      expiresAt,
    },
  });
  return authT.userId;
}

async function getTwoFactorCode(userId: number) {
  const authCodes = await prisma.twoFactorCode.findMany({
    where: { userId },
  });
  const authCodesWithAppNames = await Promise.all(
    authCodes.map(async (code) => {
      const app = await prisma.thirdPartyApp.findUnique({
        where: { id: code.thirdPartyAppId },
      });
      return { ...code, appName: app ? app.name : null };
    })
  );

  return authCodesWithAppNames;
}

async function generateUniqueCode(): Promise<string> {
  let uniqueCode: string = "";
  let isUnique = false;

  while (!isUnique) {
    uniqueCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingCode = await prisma.twoFactorCode.findUnique({
      where: { code: uniqueCode },
    });
    if (!existingCode) {
      isUnique = true;
    }
  }

  return uniqueCode;
}

async function updateTwoFactorCodes(userId: number) {
  const codes = await prisma.twoFactorCode.findMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });
  if (codes.length === 0) return;
  await Promise.all(
    codes.map(async (code) => {
      await prisma.twoFactorCode.update({
        where: { id: code.id },
        data: {
          code: await generateUniqueCode(),
          expiresAt: new Date(Date.now() + 60 * 1000),
        },
      });
    })
  );
  return "updatedCodes";
}

async function updateAndGetTwoFactorCodes(userId: number) {
  await updateTwoFactorCodes(userId);
  return await getTwoFactorCode(userId);
}

async function verifyTwoFactorCode(
  code: string,
  userId: number,
  clientSecret: string
) {
  const thirdPartyApp = await prisma.thirdPartyApp.findFirst({
    where: { clientSecret },
  });
  if (!thirdPartyApp) throw new Error("Third party app not found");

  const twoFactorCode = await prisma.twoFactorCode.findUnique({
    where: {
      code,
      userId,
      thirdPartyAppId: thirdPartyApp.id,
      expiresAt: { gte: new Date() },
    },
  });
  if (!twoFactorCode) throw new Error("Invalid or expired code");
  return twoFactorCode;
}

export {
  signUpUser,
  loginUser,
  signUpThirdPartyApp,
  loginThirdPartyApp,
  createAuthCodeForUser,
  updateAuthCode,
  retrieveAuthCode,
  linkUserAndThirdPartyApp,
  getTwoFactorCode,
  updateTwoFactorCodes,
  verifyTwoFactorCode,
  updateAndGetTwoFactorCodes,
};

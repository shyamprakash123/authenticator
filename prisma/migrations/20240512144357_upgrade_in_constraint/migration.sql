/*
  Warnings:

  - A unique constraint covering the columns `[clientSecret]` on the table `ThirdPartyApp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ThirdPartyApp_clientSecret_key" ON "ThirdPartyApp"("clientSecret");

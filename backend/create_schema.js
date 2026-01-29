const fs = require('fs');
const path = require('path');

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Lead {
  id        String   @id @default(uuid())
  email     String   @unique
  firstName String?
  lastName  String?
  company   String?
  jobTitle  String?
  website   String?
  location  String?
  timezone  String? 
  metadata  String?
  status    String   @default("NEW")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  campaignLeads CampaignLead[]
  events        Event[]
}

model Campaign {
  id        String   @id @default(uuid())
  name      String
  status    String   @default("DRAFT")
  dailyLimit Int?     
  startTime  String?  
  endTime    String?  
  timezone   String?  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sequences Sequence[]
  leads     CampaignLead[]
  events    Event[]
  mailboxId String?
  mailbox   Mailbox? @relation(fields: [mailboxId], references: [id])
}

model Sequence {
  id         String   @id @default(uuid())
  campaignId String
  title      String?
  order      Int      
  type       String   
  subject    String?
  body       String?  
  delayDays  Int      @default(0)
  delayHours Int      @default(0)
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  @@index([campaignId])
}

model CampaignLead {
  id         String   @id @default(uuid())
  campaignId String
  leadId     String
  status     String   @default("NEW")
  currentStep  Int      @default(0) 
  nextActionAt DateTime?            
  campaign   Campaign @relation(fields: [campaignId], references: [id])
  lead       Lead     @relation(fields: [leadId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@unique([campaignId, leadId])
  @@index([nextActionAt]) 
}

model Mailbox {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?  
  smtpHost    String
  smtpPort    Int
  smtpUser    String
  smtpPass    String
  imapHost    String?
  imapPort    Int?
  imapUser    String?
  imapPass    String?
  dailyLimit  Int      @default(50)
  sentCount   Int      @default(0) 
  lastReset   DateTime @default(now())
  campaigns   Campaign[]
}

model Event {
  id         String    @id @default(uuid())
  type       String
  campaignId String?
  leadId     String?
  sequenceId String?
  metadata   String?     
  createdAt  DateTime  @default(now())
  campaign   Campaign? @relation(fields: [campaignId], references: [id])
  lead       Lead?     @relation(fields: [leadId], references: [id])
  @@index([type])
  @@index([campaignId])
}
`;

fs.writeFileSync(path.join(__dirname, 'prisma', 'schema.prisma'), schema);
console.log('Schema written successfully to prisma/schema.prisma');

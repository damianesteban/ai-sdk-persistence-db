import { Prisma } from "@prisma/client";

// Re-export Prisma types for backwards compatibility with message-mapping.ts
export type MyDBUIMessagePart = Prisma.PartCreateInput;
export type MyDBUIMessagePartSelect = Prisma.Part;

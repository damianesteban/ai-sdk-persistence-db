import { Prisma } from "@prisma/client";

// Re-export Prisma types for backwards compatibility with message-mapping.ts
export type MyDBUIMessagePart = Prisma.PartCreateInput;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type MyDBUIMessagePartSelect = Prisma.PartGetPayload<{}>;

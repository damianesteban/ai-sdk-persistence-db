"use server";

import { db } from "@/lib/db";
import { MyUIMessage } from "../message-type";
import {
  mapUIMessagePartsToDBParts,
  mapDBPartToUIMessagePart,
} from "@/lib/utils/message-mapping";

export const createChat = async () => {
  const chat = await db.chat.create({
    data: {},
  });
  return chat.id;
};

export const upsertMessage = async ({
  chatId,
  message,
  id,
}: {
  id: string;
  chatId: string;
  message: MyUIMessage;
}) => {
  const mappedDBUIParts = mapUIMessagePartsToDBParts(message.parts, id);

  await db.$transaction(async (tx) => {
    await tx.message.upsert({
      where: { id },
      update: {
        chatId,
      },
      create: {
        id,
        chatId,
        role: message.role,
      },
    });

    await tx.part.deleteMany({
      where: { messageId: id },
    });

    if (mappedDBUIParts.length > 0) {
      await tx.part.createMany({
        data: mappedDBUIParts,
      });
    }
  });
};

export const loadChat = async (chatId: string): Promise<MyUIMessage[]> => {
  const result = await db.message.findMany({
    where: { chatId },
    include: {
      parts: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return result.map((message) => ({
    id: message.id,
    role: message.role,
    parts: message.parts.map((part) => mapDBPartToUIMessagePart(part)),
  }));
};

export const getChats = async () => {
  return await db.chat.findMany();
};

export const deleteChat = async (chatId: string) => {
  await db.chat.delete({
    where: { id: chatId },
  });
};

export const deleteMessage = async (messageId: string) => {
  await db.$transaction(async (tx) => {
    const targetMessage = await tx.message.findUnique({
      where: { id: messageId },
    });

    if (!targetMessage) return;

    // Delete all messages after this one in the chat
    await tx.message.deleteMany({
      where: {
        chatId: targetMessage.chatId,
        createdAt: {
          gt: targetMessage.createdAt,
        },
      },
    });

    // Delete the target message (cascade delete will handle parts)
    await tx.message.delete({
      where: { id: messageId },
    });
  });
};

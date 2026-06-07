import type { CaptureTag } from "../../types";
import { httpPostJson } from "../net/http";
import { formatTaggedListMessage } from "./messageFormat";

export async function sendDiscordCapture(
  webhookUrl: string,
  content: string,
  tag: CaptureTag,
  listName: string,
): Promise<void> {
  await httpPostJson(
    webhookUrl,
    {
      content: formatTaggedListMessage(content, tag, listName),
    },
  );
}

export async function testDiscordWebhook(webhookUrl: string): Promise<void> {
  await httpPostJson(
    webhookUrl,
    {
      content: "\u2705 Klyph test message",
    },
  );
}

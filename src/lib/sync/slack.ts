import type { CaptureTag } from "../../types";
import { httpPostJson } from "../net/http";
import { formatTaggedListMessage } from "./messageFormat";

export async function sendSlackCapture(
  webhookUrl: string,
  content: string,
  tag: CaptureTag,
  listName: string,
): Promise<void> {
  await httpPostJson(
    webhookUrl,
    {
      text: formatTaggedListMessage(content, tag, listName),
    },
  );
}

export async function testSlackWebhook(webhookUrl: string): Promise<void> {
  await httpPostJson(
    webhookUrl,
    {
      text: "\u2705 Chute test message",
    },
  );
}

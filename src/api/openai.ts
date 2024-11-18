import * as https from "https";
import fetch from "node-fetch";
import { ChatMessage, APIResponse } from "../utils/types";
import { Settings } from "../config/settings";

export class OpenAIAPI {
  private static httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  static async sendMessage(message: string): Promise<string> {
    const apiKey = await Settings.getApiKey();
    const baseUrl = await Settings.getBaseUrl();
    const model = await Settings.getCurrentModel();
    const user = await Settings.getUser();

    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const messages: ChatMessage[] = [{ role: "user", content: message }];

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      agent: this.httpsAgent,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        user: user,
      }),
    });

    const data = (await response.json()) as APIResponse;

    if (!response.ok) {
      throw new Error(`API Error: ${data.error?.message || "Unknown error"}`);
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from API");
    }

    return data.choices[0].message.content;
  }
}

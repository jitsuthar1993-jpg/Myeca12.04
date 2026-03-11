import { db } from "../db";
import { webhooks } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import fetch from "node-fetch";

interface WebhookEvent {
  event: string;
  data: any;
  timestamp: Date;
}

export class WebhookService {
  private static instance: WebhookService;

  private constructor() {}

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  async triggerEvent(event: string, data: any) {
    try {
      // Get all active webhooks that subscribe to this event
      const activeWebhooks = await db.select()
        .from(webhooks)
        .where(eq(webhooks.isActive, true));

      const relevantWebhooks = activeWebhooks.filter(webhook => {
        const events = webhook.events as string[];
        return events.includes(event) || events.includes("*");
      });

      // Trigger webhooks in parallel
      const results = await Promise.allSettled(
        relevantWebhooks.map(webhook => this.sendWebhook(webhook, { event, data, timestamp: new Date() }))
      );

      // Log results
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(`Webhook ${relevantWebhooks[index].id} failed:`, result.reason);
          this.incrementFailureCount(relevantWebhooks[index].id);
        }
      });
    } catch (error) {
      console.error("Error triggering webhooks:", error);
    }
  }

  private async sendWebhook(webhook: any, payload: WebhookEvent) {
    const signature = this.generateSignature(webhook.secret, payload);
    
    const headers: any = {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signature,
      "X-Webhook-Event": payload.event,
      ...(webhook.headers || {})
    };

    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    // Update last triggered timestamp
    await db.update(webhooks)
      .set({ lastTriggeredAt: new Date() })
      .where(eq(webhooks.id, webhook.id));

    return response;
  }

  private generateSignature(secret: string, payload: any): string {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest("hex");
  }

  private async incrementFailureCount(webhookId: number) {
    const [webhook] = await db.select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (webhook) {
      const newFailureCount = webhook.failureCount + 1;
      
      // Disable webhook if it fails too many times
      const updates: any = { failureCount: newFailureCount };
      if (newFailureCount >= 5) {
        updates.isActive = false;
      }

      await db.update(webhooks)
        .set(updates)
        .where(eq(webhooks.id, webhookId));
    }
  }
}

// Export singleton instance
export const webhookService = WebhookService.getInstance();

// Predefined webhook events
export const WebhookEvents = {
  // Blog events
  BLOG_CREATED: "blog.created",
  BLOG_UPDATED: "blog.updated",
  BLOG_DELETED: "blog.deleted",
  BLOG_PUBLISHED: "blog.published",
  
  // User events
  USER_REGISTERED: "user.registered",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_ROLE_CHANGED: "user.role_changed",
  
  // Service events
  SERVICE_CREATED: "service.created",
  SERVICE_UPDATED: "service.updated",
  SERVICE_DELETED: "service.deleted",
  
  // Lead events
  LEAD_CREATED: "lead.created",
  LEAD_UPDATED: "lead.updated",
  
  // Tax return events
  TAX_RETURN_FILED: "tax_return.filed",
  TAX_RETURN_VERIFIED: "tax_return.verified",
  
  // System events
  SYSTEM_SETTINGS_UPDATED: "system.settings_updated",
  BACKUP_COMPLETED: "system.backup_completed",
  
  // Analytics events
  THRESHOLD_REACHED: "analytics.threshold_reached",
};
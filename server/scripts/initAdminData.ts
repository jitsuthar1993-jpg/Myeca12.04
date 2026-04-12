// @ts-nocheck
import { db } from "../db.js";
import { 
  blogCategories, blogTags, siteSettings, emailTemplates, pages 
} from "../../shared/schema.js";

async function initAdminData() {
  try {
    console.log("Initializing admin data...");

    // Create blog categories
    const categories = [
      { name: "Tax Tips", slug: "tax-tips", description: "Tips and advice for tax filing" },
      { name: "Business News", slug: "business-news", description: "Latest business and finance news" },
      { name: "Compliance Updates", slug: "compliance-updates", description: "Regulatory and compliance updates" },
      { name: "Startup Guide", slug: "startup-guide", description: "Guides for startups and entrepreneurs" }
    ];

    for (const category of categories) {
      await db.insert(blogCategories).values(category).onConflictDoNothing();
    }

    // Create blog tags
    const tags = [
      { name: "Income Tax", slug: "income-tax", description: "Income tax related content" },
      { name: "GST", slug: "gst", description: "GST related content" },
      { name: "Company Registration", slug: "company-registration", description: "Company registration topics" },
      { name: "Tax Saving", slug: "tax-saving", description: "Tax saving tips and strategies" },
      { name: "2024-25", slug: "2024-25", description: "Financial year 2024-25" }
    ];

    for (const tag of tags) {
      await db.insert(blogTags).values(tag).onConflictDoNothing();
    }

    // Create additional site settings
    const settings = [
      { key: "site_name", value: "MyeCA.in", category: "general" },
      { key: "site_tagline", value: "India's Premier Tax Filing Platform", category: "general" },
      { key: "admin_email", value: "admin@myeca.in", category: "general" },
      { key: "support_email", value: "support@myeca.in", category: "general" },
      { key: "max_upload_size", value: "10485760", category: "media" }, // 10MB
      { key: "allowed_file_types", value: "pdf,jpg,jpeg,png,doc,docx", category: "media" },
      { key: "webhook_timeout", value: "30000", category: "webhooks" },
      { key: "api_rate_limit", value: "1000", category: "api" }
    ];

    for (const setting of settings) {
      await db.insert(siteSettings).values(setting).onConflictDoNothing();
    }

    // Create email templates
    const emailTemplates = [
      {
        name: "Welcome Email",
        slug: "welcome-email",
        subject: "Welcome to MyeCA.in - Your Tax Filing Journey Starts Here!",
        htmlContent: `<h1>Welcome {{firstName}}!</h1>
<p>Thank you for joining MyeCA.in. We're excited to help you with your tax filing needs.</p>
<p>Here's what you can do next:</p>
<ul>
  <li>Complete your profile</li>
  <li>Upload your documents</li>
  <li>Start filing your ITR</li>
</ul>
<p>If you have any questions, feel free to reach out to our support team.</p>`,
        textContent: `Welcome {{firstName}}!
Thank you for joining MyeCA.in. We're excited to help you with your tax filing needs.`,
        variables: JSON.stringify(["firstName", "email"]),
        category: "transactional"
      },
      {
        name: "Tax Return Filed",
        slug: "tax-return-filed",
        subject: "Your Tax Return Has Been Successfully Filed",
        htmlContent: `<h1>Congratulations {{firstName}}!</h1>
<p>Your tax return for AY {{assessmentYear}} has been successfully filed.</p>
<p>Acknowledgment Number: <strong>{{acknowledgmentNumber}}</strong></p>
<p>Please keep this for your records.</p>`,
        textContent: `Congratulations {{firstName}}! Your tax return has been filed.`,
        variables: JSON.stringify(["firstName", "assessmentYear", "acknowledgmentNumber"]),
        category: "transactional"
      }
    ];

    for (const template of emailTemplates) {
      await db.insert(emailTemplates).values(template).onConflictDoNothing();
    }

    // Create sample pages
    const samplePages = [
      {
        title: "About Us",
        slug: "about-us",
        content: `<h1>About MyeCA.in</h1>
<p>MyeCA.in is India's premier digital platform for professional tax filing services.</p>`,
        metaTitle: "About Us - MyeCA.in",
        metaDescription: "Learn about MyeCA.in, India's premier tax filing platform",
        status: "published",
        authorId: 1,
        publishedAt: new Date()
      },
      {
        title: "Contact Us",
        slug: "contact-us",
        content: `<h1>Contact Us</h1>
<p>We're here to help with all your tax filing needs.</p>
<p>Email: support@myeca.in</p>
<p>Phone: 1800-123-4567</p>`,
        metaTitle: "Contact Us - MyeCA.in",
        metaDescription: "Get in touch with MyeCA.in support team",
        status: "published",
        authorId: 1,
        publishedAt: new Date()
      }
    ];

    for (const page of samplePages) {
      await db.insert(pages).values(page).onConflictDoNothing();
    }

    console.log("Admin data initialized successfully!");
  } catch (error) {
    console.error("Error initializing admin data:", error);
  }
}

// Run the initialization
initAdminData().then(() => {
  console.log("Done!");
  process.exit(0);
}).catch(error => {
  console.error("Failed:", error);
  process.exit(1);
});

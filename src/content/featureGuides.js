// Copy for the feature guide hub (DocumentationPage), the "Things to know"
// cards on each screen (components/ThingsToKnow.vue) and the go-live checklist.
// Keep it in plain language: this is read by clients, not developers.

export const FEATURE_GUIDES = [
  {
    id: "bot-profile",
    name: "Bot profile",
    icon: "$user-cog",
    route: "/dashboard/bot-profile",
    summary:
      "Your bot's name, tone, business facts, and rules, all set by you.",
    steps: [
      "Fill in Identity, Business facts, Rules, Escalation, and Conversation, then save the draft.",
      "Click Test in sandbox and ask the questions your customers ask.",
      "When the answers look right, click Publish.",
    ],
    thingsToKnow: [
      "Changes do nothing for customers until you publish them. Saving only updates your draft.",
      "The sandbox tests your saved draft, so you can try changes before they go live.",
      "Business facts win over your website. If they disagree, the bot uses the facts on this page.",
      "Messages with an escalation keyword always go to a person.",
      "When an answer takes more than a few seconds (6 by default), the customer first gets a short holding message. You can turn it off or change the timing under Conversation. The sandbox doesn't send it.",
      "Under Conversation you can also set how many AI replies one chat gets in 24 hours (website and WhatsApp separately), and the handoff message sent when the limit is reached.",
      "The holding and handoff messages can be Auto (the bot writes them for each customer, in their language and your tone) or Fixed text. Auto falls back to the fixed text if it fails.",
      "You can restore any of your last 20 published versions from History.",
    ],
  },
  {
    id: "knowledge",
    name: "Knowledge",
    icon: "$folder-open",
    route: "/dashboard/knowledge",
    summary:
      "Everything the chatbot knows, grouped into sources: your website pages, documents you upload, FAQs, notes you write, and answers learned from chats.",
    steps: [
      "Create a Website source and import pages by URL, sitemap, or a CSV/JSON file.",
      "Add a Notes source for facts that aren't on your website, like policies, timings, or contact details.",
      "Click Upload document to add a PDF, Word or text file.",
      "Open an item to check its text, edit it, and publish it. Only published items are used by the bot.",
    ],
    thingsToKnow: [
      "Website pages are read once, when you import them. Nothing refreshes on its own: when your site changes, re-import the page or edit its text here.",
      "Re-importing a page you edited by hand replaces your edits with the website's current text.",
      "Unpublishing, archiving, or deleting takes effect right away. Pausing a source hides all of it from the bot without deleting anything.",
      "Pages behind a login, or sites that block bots, may come out empty or incomplete. Open the page to check its text.",
      "The chatbot treats everything published as true, so archive old offers and anything you don't want quoted.",
      "If the chatbot gives a wrong answer, find the item it came from, then fix it or unpublish it. \"What the bot searches\" on an item shows the exact text the bot uses.",
      "Upload a PDF, Word or text file (up to 15 MB) and the bot learns from it: each section becomes an item you can review and edit. Scanned PDFs (pictures of pages) aren't supported yet; upload the original document or a PDF saved from Word. To update a document, upload the new version: its sections replace the old ones once it's ready, and the old version keeps working until then. We keep only the text, not the file.",
      "We check your knowledge every day and every week: items past their 'valid until' date are hidden from the bot automatically, offers whose dates have passed and pages that disappeared from your website are flagged, and contradictions are re-checked. Your health score is the share of your published knowledge with no open problems. Every Monday we email your alert contacts a short report with what to fix first.",
    ],
  },
  {
    id: "setup",
    name: "Setup and go live",
    icon: "$rocket",
    route: "/dashboard/setup",
    summary:
      "A guided setup for a new bot, or for rebuilding your knowledge without downtime: import your website, review the Bot Profile and FAQs, test, then switch over.",
    steps: [
      "Start a setup: New client, or Rebuild my knowledge.",
      "Work through the steps: website, Bot Profile, FAQs, issues, and tests.",
      "When the checklist is complete, click Switch over.",
    ],
    thingsToKnow: [
      "Nothing you build in a setup reaches customers until you switch over. They keep getting your current answers.",
      "Test the new knowledge in staging: pick \"New setup (staging)\" in the sandbox and when you run tests.",
      "Switching over deletes the old knowledge sources you're replacing, in the same step that makes the new ones live.",
      "Every required checklist item must be done before you can go live.",
    ],
  },
  {
    id: "quality",
    name: "Quality tests",
    icon: "$circle-check",
    route: "/dashboard/quality",
    summary:
      "Test questions with expected answers. A run asks your bot every question and an AI judge grades each reply.",
    steps: [
      "Click Generate from FAQs to turn your FAQs into test questions, or add your own.",
      "Click Run tests. The first finished run becomes your baseline.",
      "Open a run to see what failed and why, then fix the knowledge or the test question.",
    ],
    thingsToKnow: [
      "Tests use your FAQs as questions, including other ways customers ask them.",
      "Runs happen in the sandbox, so customers never see them.",
      "Every run is compared with your baseline. A drop of more than 5 points is flagged as a regression.",
      "Test your draft Bot Profile with \"Test my draft profile\" before you publish it.",
      "A failing test means the knowledge is wrong or missing, or the test question's expected answer is out of date.",
    ],
  },
  {
    id: "knowledge-checks",
    name: "Knowledge checks",
    icon: "$shield-alert",
    route: "/dashboard/knowledge/issues",
    summary:
      "We check new knowledge before the bot uses it: contradictions, duplicates, secrets and ID numbers, other people's contact details, and text that tries to give the bot instructions.",
    steps: [
      "Open Knowledge > Issues to see what the checks found.",
      "Open an issue to compare the two items side by side, with the conflicting words highlighted.",
      "Edit or archive the wrong item, then resolve the issue. Dismiss it, with a reason, if it isn't a problem.",
    ],
    thingsToKnow: [
      "Every item is checked when it's published. If a blocker is found, the item stays out of the bot's reach and shows \"Needs review\".",
      "When two items disagree, the more trusted one wins: FAQs over notes, and notes over website pages. The other is held (hidden from the bot) until the issue is resolved.",
      "\"Publish anyway\" needs a reason, which is saved with the item.",
      "A dismissed issue only comes back if the item's text changes. Editing, unpublishing, archiving, or deleting an item closes its issues.",
      "Give an item a \"valid until\" date (pages, notes and document sections) and the bot stops using it after that date. Setting a later date or clearing it shows it again right away.",
      "Issues found by the daily and weekly checks close themselves when the problem is gone. Info findings, like items no customer reply used in 60 days, are suggestions and don't lower your health score.",
    ],
  },
  {
    id: "faqs",
    name: "FAQs",
    icon: "$message-circle-question-mark",
    route: "/dashboard/knowledge",
    summary:
      "Questions with exact answers. When a customer's question matches, the bot gives your answer.",
    steps: [
      "In Knowledge, create an FAQs source.",
      "Add FAQs one by one, import a CSV (download the template first), or click Suggest from website.",
      "Review suggested FAQs: approve the good ones and reject the rest.",
    ],
    thingsToKnow: [
      "FAQ answers take priority over text from your website, so use them for anything the bot must get exactly right.",
      "Add other ways customers ask the same question. More phrasings help the bot match.",
      "Suggested FAQs are drafts. Nothing reaches customers until you approve it.",
      "Editing a published FAQ updates the live answer once it has been re-indexed.",
    ],
  },
  {
    id: "knowledge-gap",
    name: "Knowledge gap",
    icon: "$lightbulb",
    route: "/dashboard/knowledge-gap",
    summary:
      "Questions customers asked that the chatbot couldn't answer. Answer them once and the chatbot learns the answer.",
    steps: [
      "Open a pending question to see the conversation it came from.",
      "Write the correct answer and save it.",
      "Defer questions you don't want the chatbot to answer.",
    ],
    thingsToKnow: [
      "Check this list every day in your first weeks live. It's the fastest way to improve answers.",
      "Write answers as you'd want them repeated to any customer. Don't include one person's details.",
      "Your answer is published as an FAQ in the \"Learned from chats\" source in Knowledge. Edit it, add other ways to ask, or unpublish it there.",
    ],
  },
  {
    id: "chats",
    name: "Chats",
    icon: "$message-square-text",
    route: "/dashboard/chat",
    summary:
      "Every conversation from your website and WhatsApp, live. Read along, take over, and close tickets.",
    steps: [
      "Open a chat to see the full history as it happens.",
      "Turn AI off for that chat to reply yourself, and turn it back on when you're done.",
      "Set the ticket status so your team knows what's handled.",
    ],
    thingsToKnow: [
      "Replying needs the chat:reply permission. Reading needs chat:read. Set these in Team.",
      "Your replies are sent as your business, not as the AI.",
      "Turn AI off before you reply, so the bot doesn't answer at the same time as you.",
      "You only ever see your own business's chats.",
    ],
  },
  {
    id: "sandbox",
    name: "Sandbox",
    icon: "$flask-conical",
    route: "/dashboard/sandbox",
    summary:
      "Test the chatbot as a customer would, with real answers, without anything reaching customers.",
    steps: [
      "Ask the questions your customers ask most.",
      "Switch between the website assistant and the WhatsApp bot to compare them.",
      "Fix any wrong answer in Knowledge or Knowledge Gap, then ask again.",
    ],
    thingsToKnow: [
      "Nothing in the sandbox is sent to customers, and it doesn't trigger alerts.",
      "The sandbox uses your saved Bot Profile draft, so you can test changes before you publish them.",
      "Before going live, test pricing, refunds, timings, and \"talk to a human\" questions.",
    ],
  },
  {
    id: "widget",
    name: "Website widget",
    icon: "$code",
    route: "/dashboard/integration?section=widget",
    summary:
      "The chat bubble on your website. Paste one script tag and choose which domains can use it.",
    steps: [
      "Copy the embed script from Integrations → Website Widget.",
      "Paste it before </body> on every page where you want the chat.",
      "Add your domains under Allowed domains, then save.",
      "Set your support WhatsApp number, so escalated chats can reach your team.",
    ],
    thingsToKnow: [
      "Once you add any domain, the chat only works on those sites. Add staging domains too if you test there.",
      "Each visitor gets a private session issued by our server, so no visitor can read another visitor's chat.",
      "The key in the script is public by design. The domain list is what protects it.",
      "Visitors who chatted before the security update still see their history.",
      "Set your support WhatsApp number so escalated website chats can reach your team; without it, customers see no WhatsApp link.",
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "$whatsapp",
    route: "/dashboard/integration?section=tellephant",
    summary:
      "Let the bot reply on your WhatsApp Business number through Tellephant.",
    steps: [
      "Save your Tellephant API key. We check it with Tellephant when you save.",
      "Paste the webhook URL into your Tellephant account.",
      "Turn on automatic replies.",
    ],
    thingsToKnow: [
      "Treat the webhook URL as a password. If it leaks, regenerate it.",
      "WhatsApp chats show up in Chats next to website chats.",
    ],
  },
  {
    id: "ai-provider",
    name: "AI provider",
    icon: "$bot",
    route: "/dashboard/integration?section=ai-provider",
    summary: "The OpenAI account that powers your chatbot's answers.",
    steps: [
      "Open Integrations → AI Provider and add your OpenAI key.",
      "Turn on automatic AI replies.",
    ],
    thingsToKnow: [
      "Your key is never shown again after you save it. To change it, enter a new one.",
      "Usage is billed to your OpenAI account, so set a spending limit there.",
    ],
  },
  {
    id: "security",
    name: "Security: how we protect your keys",
    icon: "$shield-check",
    summary:
      "What happens to the API keys, WhatsApp key and headers you give us.",
    steps: [
      "Create a dedicated OpenAI project key just for ScraperAI, with a monthly spending limit (OpenAI dashboard → Projects → API keys / Limits). You can revoke it at any time without affecting your other systems.",
      "To change a key, enter a new one. To stop its use, remove it.",
    ],
    thingsToKnow: [
      "Encrypted before it's stored. Your API keys, WhatsApp key and integration/webhook headers are encrypted with AES-256-GCM (the encryption standard banks use) before they reach our database. Database backups only ever contain the encrypted form.",
      "Never shown again. Once saved, a key is never sent back to any screen or API, not to you, your team or our support staff. You'll only see that it's set and, for headers, masked values (********). To change it, enter a new one.",
      "Used only for its purpose. Your OpenAI key is used only to write your bot's replies to your customers. It's decrypted in memory just for that request, sent only to OpenAI over an encrypted connection (HTTPS), and never written to logs.",
      "You stay in control. Replace or remove a key at any time. Removing it stops its use immediately.",
    ],
  },
  {
    id: "webhooks",
    name: "Webhooks & API config",
    icon: "$webhook",
    route: "/dashboard/integration?section=webhooks",
    summary:
      "Tell your systems when a chat needs a person, shows buying interest, or needs a follow-up. Connect product and customer APIs for live answers.",
    steps: [
      "Add a URL for Escalate, Upsell, or Follow-up events.",
      "Connect your product or customer API under API Config so the bot can answer with live data.",
    ],
    thingsToKnow: [
      "Set up Escalate before going live, so \"I want to talk to a person\" reaches your team.",
      "Your endpoint should respond quickly. Slow endpoints can time out.",
      "If we can't send an escalation to your system (the call fails, or the webhook was switched off after 3 failures), we email your alert addresses with the customer's phone, channel and message so someone can contact them. Set them under Escalate; empty means your account email. A webhook you turned off yourself sends no alerts.",
    ],
  },
  {
    id: "product-api",
    name: "Product API",
    icon: "$tag",
    route: "/dashboard/integration?section=api-config&tab=product-api",
    summary:
      "Let the bot answer price and stock questions from your own product system.",
    steps: [
      "Build one URL that answers both a search and a full listing. Use our format, or map your own field names under Field mapping.",
      "Open Integrations → API Config → Product API, enter the URL and how we sign in, and use \"Try it\" before saving. It shows what we send, what comes back, and what the AI sees.",
      "Save (saving test-calls your API), then ask \"what's available?\" in the sandbox.",
      "Check Recent calls on the same page if answers stop showing live data.",
    ],
    thingsToKnow: [
      "The bot only states prices and stock from this data, never from your website text.",
      "The full listing must include prices and availability. Without availability, the bot can't say which products are in stock.",
      "Broad questions like \"which bikes are available?\" or \"cheapest petrol scooty\" are answered from the full listing, filtered to what's in stock.",
      "Respond within 3 seconds (the timeout setting). The full listing can be up to 10 MB.",
      "Sign-in: headers (as before), a bearer token, a username and password (Basic), or an API key in the URL (e.g. ?api_key=…). Tokens, passwords and keys are encrypted and never shown again.",
      "Extra parameters are sent with every call. Values and the URL can use {{query}} and {{limit}}, e.g. https://api.example.com/products/search/{{query}}.",
      "Reliability: we retry once on connection errors, never wait longer than your timeout, and pause calls for 60 seconds after 5 failures in a minute, so customers aren't kept waiting. Recent calls on the settings page shows every call from the last 7 days.",
    ],
    format: true,
  },
  {
    id: "customer-api",
    name: "Customer API",
    icon: "$user-search",
    route: "/dashboard/integration?section=api-config&tab=customer-api",
    summary:
      "Let the WhatsApp bot look up a customer's bookings and bills by their phone number.",
    steps: [
      "Open Integrations → API Config → Customer API and enter your URL and the phone parameter name.",
      "Choose how we sign in, and add any extra parameters your API needs.",
      "Save with a test phone number (saving test-calls your API), then run a test with a phone number.",
    ],
    thingsToKnow: [
      "Real chats look up customers on WhatsApp only, by the sender's number.",
      "Sign-in: headers (as before), a bearer token, a username and password (Basic), or an API key in the URL (e.g. ?api_key=…). Tokens, passwords and keys are encrypted and never shown again.",
      "Extra parameters are sent with every call. Values and the URL can use {{phone}}.",
      "Reliability: we retry once on connection errors, never wait longer than your timeout, and pause calls for 60 seconds after 5 failures in a minute, so customers aren't kept waiting. Recent calls on the settings page shows every call from the last 7 days.",
    ],
  },
  {
    id: "bot-health",
    name: "Bot health",
    icon: "$activity",
    route: "/dashboard/bot-health",
    summary:
      "How your bot's live replies went: errors, handoffs, answer time, and AI cost.",
    steps: [
      "Open Bot Health and pick 24 hours, 7 days or 30 days.",
      "Check the Problems list. Open the chat for any error, since the customer may not have received a proper answer.",
      "In any chat, click \"Why this answer\" under a bot reply to see what the bot searched and used.",
    ],
    thingsToKnow: [
      "Every live bot reply on your website and WhatsApp is recorded: the customer's message, the reply, timing, tokens, product lookups, and what the bot used to answer.",
      "Records are kept for 30 days. Older replies have no \"Why this answer\".",
      "AI costs are estimates from OpenAI's list prices. Your OpenAI bill is the exact amount.",
      "An error means the customer may not have received a proper answer, so open the chat and follow up.",
      "If many replies fail or your product API stops responding, we email your alert addresses, once when it starts and once when it's fixed. Alerts show up 5–10 minutes after a problem starts. The addresses are set under Integrations → Webhooks → Escalate.",
    ],
  },
  {
    id: "analytics",
    name: "Analytics & insights",
    icon: "$chart-line",
    route: "/dashboard/chat-analytics",
    summary:
      "Conversation volume, engagement, and growth opportunities across your chats.",
    steps: [
      "Check Chat Analytics weekly to see what customers ask most.",
      "Use Opportunity Analysis to find content or services worth adding.",
    ],
    thingsToKnow: [
      "Numbers come from your real chats. Expect them to fill in over your first few weeks live.",
    ],
  },
  {
    id: "call-analysis",
    name: "Call analysis",
    icon: "$phone",
    route: "/dashboard/call-batches",
    summary:
      "Upload call recordings in batches and get an AI report on each call, with issues marked by timestamp.",
    steps: [
      "Create a batch with each agent's name, the recording URL, and an email.",
      "Open the batch report, then drill into single calls.",
      "Retry any call that failed to process.",
    ],
    thingsToKnow: [
      "Recording URLs must be reachable by our servers. Private or expiring links will fail.",
      "Click an issue's timestamp to jump to that moment in the recording.",
    ],
  },
  {
    id: "team",
    name: "Team & roles",
    icon: "$users",
    route: "/dashboard/team",
    summary:
      "Invite people and decide what each person can do with roles and permissions.",
    steps: [
      "Create roles, for example Agent (chat:read and chat:reply) and Admin (everything).",
      "Invite members and give each one a role.",
    ],
    thingsToKnow: [
      "Give people only the permissions they need. Settings, domains, and API keys need settings:manage.",
      "When someone leaves, remove them from Team right away.",
    ],
  },
];

// The format a client's Product API must follow. Rendered by
// components/integrations/ProductApiFormat.vue on the Product API page and in
// the Guide.
export const PRODUCT_API_FORMAT = {
  calls: [
    {
      title: "Search",
      when: "When a customer names a model.",
      request: "GET <your url>?q=<words>&limit=5",
      note: "The parameter name is your \"Query parameter name\" setting (q by default). With POST, the same fields go in a JSON body.",
    },
    {
      title: "Full listing",
      when: "Every 6 hours for the product names, and live (cached 5 minutes) for \"what's available?\" questions.",
      request: "GET <your url>?mode=index&limit=2000&q=",
      note: "Must include every product you rent or sell, with prices and availability.",
    },
  ],
  response:
    "Both calls return the same item format: a JSON list of items, or an object holding the list. Set \"Results path\" (e.g. data.items) or leave it empty to auto-detect.",
  example: `{
  "sku": "2",                       // required, unique
  "name": "Honda Navi",             // required
  "category": "scooter",
  "url": "https://…/honda-navi",    // the product page the bot links to
  "aliases": ["navi", "scooty"],    // other names customers use
  "prices": [
    { "label": "Monthly", "amount": 3099, "unit": "month", "currency": "INR" },
    { "label": "Weekly", "amount": null, "note": "Weekly plan not offered for this model" }
  ],
  "conditions": ["Minimum 3 months"],   // optional, quoted with the price
  "attributes": { "fuel": "petrol", "engine": "110cc" },
  "availability": {
    "status": "in_stock",           // in_stock | limited | out_of_stock | on_request
    "locations": ["Koramangala"],
    "next_available_at": null       // ISO date if known
  },
  "updated_at": "2026-10-08T07:22:39+05:30"
}`,
  mapping: {
    intro:
      "Your API doesn't have to match this format. Under Field mapping, tell us where each field is inside one of your products. For example, if your API sends:",
    theirs: `{
  "id": 17,
  "title": "Ather 450X",
  "pricing": { "monthly": 4999 },
  "stock": { "state": "Waitlist" },
  "specs": { "fuel_type": "electric" }
}`,
    map:
      "map Name → title, Amount → pricing.monthly (label Monthly, per month), Stock value → stock.state with \"Waitlist\" meaning out of stock, and an attribute fuel → specs.fuel_type. We then read it as:",
    ours: `{
  "sku": "17",
  "name": "Ather 450X",
  "prices": [{ "label": "Monthly", "amount": 4999, "unit": "month", "currency": "INR" }],
  "attributes": { "fuel": "electric" },
  "availability": { "status": "out_of_stock" }
}`,
    stock:
      "Stock values understood without mapping: in_stock, limited, out_of_stock, on_request, true/false, and numbers (0 = out of stock). A value we don't understand makes no stock claim, so the bot won't say the product is in stock.",
  },
  notes: [
    "A plan with amount null and a note is shown as \"not offered\". The bot never invents a price.",
    "Waitlisted or no units free → out_of_stock. Only a few left → limited.",
    "Attributes are shown as features. \"fuel\" lets customers ask for \"electric\" or \"petrol\".",
    "Aliases help the bot recognise the product when customers use other names.",
    "The bot only states prices and stock from this data, never from website text.",
  ],
};

// Short version shown next to every field that takes a secret
// (components/SecretNotice.vue). Keep it no stronger than the security guide.
export const SECRET_NOTICE =
  "Encrypted with AES-256-GCM before it's stored, and never shown again once saved. Replace or remove it at any time.";

export function featureGuide(id) {
  return FEATURE_GUIDES.find((g) => g.id === id);
}

// `check` names an automatic status DocumentationPage knows how to compute.
// Items without one are manual: we link to them but can't verify them.
export const GO_LIVE_CHECKLIST = [
  {
    id: "content",
    title: "Import and publish your website",
    text: "At least your main pages: services, pricing, FAQs, and contact.",
    route: "/dashboard/knowledge",
    required: true,
    check: "hasPages",
  },
  {
    id: "ai",
    title: "Connect your AI provider",
    text: "Add your OpenAI key so answers are billed to your account.",
    route: "/dashboard/integration?section=ai-provider",
    required: false,
    check: "aiConfigured",
  },
  {
    id: "bot-profile",
    title: "Set up and publish your bot profile",
    text: "Name, tone, opening hours, contact details, and policies.",
    route: "/dashboard/bot-profile",
    required: false,
  },
  {
    id: "sandbox",
    title: "Test in the sandbox",
    text: "Ask your top 10 customer questions and fix any wrong answers.",
    route: "/dashboard/sandbox",
    required: true,
  },
  {
    id: "widget",
    title: "Install the widget on your website",
    text: "Paste the embed script on every page where you want the chat.",
    route: "/dashboard/integration?section=widget",
    required: true,
  },
  {
    id: "domains",
    title: "Lock the widget to your domains",
    text: "Without this, any website can embed your chatbot.",
    route: "/dashboard/integration?section=widget",
    required: true,
    check: "domainsSet",
  },
  {
    id: "escalate",
    title: "Set up escalation",
    text: "Add an Escalate webhook so requests for a person reach your team.",
    route: "/dashboard/integration?section=webhooks",
    required: false,
    check: "escalateSet",
  },
  {
    id: "team",
    title: "Invite your team with the right roles",
    text: "Agents need chat:read and chat:reply to answer live chats.",
    route: "/dashboard/team",
    required: false,
  },
  {
    id: "gaps",
    title: "Clear pending knowledge gaps",
    text: "Answer or defer the questions the chatbot couldn't answer.",
    route: "/dashboard/knowledge-gap",
    required: false,
    check: "noPendingGaps",
  },
  {
    id: "whatsapp",
    title: "Connect WhatsApp (optional)",
    text: "Only needed if you want the bot on your WhatsApp Business number.",
    route: "/dashboard/integration?section=tellephant",
    required: false,
    check: "whatsappOn",
  },
];

// Client-facing summary of documentation/platform-roadmap/v1 in the backend
// repo. No dates: we only list what is coming, in rough order.
export const COMING_NEXT = [
  {
    icon: "$folder-tree",
    title: "Documents as sources",
    text: "Upload PDFs and Word documents as knowledge sources, next to your website, FAQs, and notes.",
  },
  {
    icon: "$badge-alert",
    title: "Knowledge health checks",
    text: "Automatic warnings about contradictions, outdated content, and duplicates, plus a weekly digest.",
  },
  {
    icon: "$rocket",
    title: "Onboarding wizard",
    text: "A guided setup with a readiness score, so you can go live in under 30 minutes.",
  },
  {
    icon: "$database-zap",
    title: "Live product and customer data",
    text: "Connect your product and customer systems with mapping and preview, so answers use live stock, prices, and order status.",
  },
  {
    icon: "$messages-square",
    title: "Conversations and summaries",
    text: "Chats grouped into conversations with automatic summaries, plus WhatsApp 24-hour window handling.",
  },
  {
    icon: "$shield-user",
    title: "Verified customers",
    text: "Phone verification and signed sign-in from your app, so the bot can safely discuss a customer's own account.",
  },
  {
    icon: "$zap",
    title: "Actions",
    text: "The bot can do things for customers, like extending a booking or sending a payment link, with confirmation first.",
  },
  {
    icon: "$flame",
    title: "Lead scoring and follow-ups",
    text: "Hot leads are flagged automatically, and follow-up messages go out on rules you set.",
  },
  {
    icon: "$smartphone",
    title: "SDKs for apps",
    text: "Add the chat to React and React Native apps, with native iOS and Android to follow.",
  },
];

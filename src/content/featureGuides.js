// Copy for the feature guide hub (DocumentationPage), the "Things to know"
// cards on each screen (components/ThingsToKnow.vue) and the go-live checklist.
// Keep it in plain language: this is read by clients, not developers.

export const FEATURE_GUIDES = [
  {
    id: "bot-profile",
    name: "Bot profile",
    icon: "mdi-account-cog-outline",
    route: "/dashboard/bot-profile",
    summary:
      "Your bot's name, tone, business facts, and rules, all set by you.",
    steps: [
      "Fill in Identity, Business facts, Rules, and Escalation, then save the draft.",
      "Click Test in sandbox and ask the questions your customers ask.",
      "When the answers look right, click Publish.",
    ],
    thingsToKnow: [
      "Changes do nothing for customers until you publish them. Saving only updates your draft.",
      "The sandbox tests your saved draft, so you can try changes before they go live.",
      "Business facts win over your website. If they disagree, the bot uses the facts on this page.",
      "Messages with an escalation keyword always go to a person.",
      "You can restore any of your last 20 published versions from History.",
    ],
  },
  {
    id: "website-content",
    name: "Website content",
    icon: "mdi-web",
    route: "/dashboard/page-list",
    summary:
      "The pages the chatbot learns from. Add a sitemap or single URLs, or upload JSON or CSV files, then scrape them.",
    steps: [
      "Open Page List and add your sitemap URL, a single page, or a JSON/CSV file.",
      "Click Scrape All Pages, or scrape pages one at a time.",
      "Check Scraped Pages to confirm each page was read correctly.",
    ],
    thingsToKnow: [
      "The chatbot only knows what has been scraped. A page that is listed but not scraped teaches it nothing.",
      "TTL (sec) is how long until a page is re-scraped automatically. The default is about 3 months. Use a shorter TTL for pages that change often, like 86400 for daily. Pages are checked once an hour, so a TTL under 3600 won't refresh any faster.",
      "Pages behind a login, or sites that block bots, may come out empty or incomplete. Check them in Scraped Pages.",
      "Don't add pages you don't want quoted, like old offers or internal pages. The chatbot treats everything it has learned as true.",
    ],
  },
  {
    id: "content-chunks",
    name: "Content chunks",
    icon: "mdi-text-box-multiple-outline",
    route: "/dashboard/content-chunks",
    summary:
      "The short pieces of text the chatbot searches when it answers. Every scraped page is split into chunks.",
    steps: [
      "Search for a topic to see exactly what the chatbot will find.",
      "Delete chunks that are wrong or out of date.",
      "Use Add Content Manual to add facts that aren't on your website.",
    ],
    thingsToKnow: [
      "If the chatbot gives a wrong answer, search here first. The wrong text usually comes from a chunk.",
      "Deleting a chunk takes effect right away, but it comes back the next time its page is re-scraped. To remove it for good, fix the text on the page itself.",
      "Manual content is the quickest way to add policies, timings, or contact details that aren't published on your site.",
    ],
  },
  {
    id: "knowledge-gap",
    name: "Knowledge gap",
    icon: "mdi-lightbulb-on-outline",
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
      "Your answer is saved as manual content. To change or remove it later, find it in Content Chunks.",
    ],
  },
  {
    id: "chats",
    name: "Chats",
    icon: "mdi-message-text-outline",
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
    icon: "mdi-flask-outline",
    route: "/dashboard/sandbox",
    summary:
      "Test the chatbot as a customer would, with real answers, without anything reaching customers.",
    steps: [
      "Ask the questions your customers ask most.",
      "Switch between the website assistant and the WhatsApp bot to compare them.",
      "Fix any wrong answer in Content Chunks or Knowledge Gap, then ask again.",
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
    icon: "mdi-code-tags",
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
    icon: "mdi-whatsapp",
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
    icon: "mdi-robot-outline",
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
    id: "webhooks",
    name: "Webhooks & API config",
    icon: "mdi-webhook",
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
    ],
  },
  {
    id: "analytics",
    name: "Analytics & insights",
    icon: "mdi-chart-line",
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
    icon: "mdi-phone-outline",
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
    id: "forms",
    name: "Forms",
    icon: "mdi-list-box-outline",
    route: "/dashboard/forms",
    summary:
      "Build lead forms with fields and stages, share them by link or API, and track submissions.",
    steps: [
      "Create a form and add its fields.",
      "Define stages, like New, Contacted, and Won, to track each lead.",
      "Share the link, or submit through the API or a webhook.",
    ],
    thingsToKnow: [
      "Removing a stage moves its leads to the stage you choose.",
      "Submissions sent through the API show up next to submissions from the form link.",
    ],
  },
  {
    id: "team",
    name: "Team & roles",
    icon: "mdi-account-multiple-outline",
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

export function featureGuide(id) {
  return FEATURE_GUIDES.find((g) => g.id === id);
}

// `check` names an automatic status DocumentationPage knows how to compute.
// Items without one are manual: we link to them but can't verify them.
export const GO_LIVE_CHECKLIST = [
  {
    id: "content",
    title: "Add and scrape your website",
    text: "At least your main pages: services, pricing, FAQs, and contact.",
    route: "/dashboard/page-list",
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
    icon: "mdi-file-tree-outline",
    title: "Knowledge sources with review",
    text: "Manage your website, FAQs, and documents (PDF, DOCX) as sources. Review what the bot learns before it goes live, and remove a source in one click.",
  },
  {
    icon: "mdi-alert-decagram-outline",
    title: "Knowledge health checks",
    text: "Automatic warnings about contradictions, outdated content, and duplicates, plus a weekly digest.",
  },
  {
    icon: "mdi-rocket-launch-outline",
    title: "Onboarding wizard",
    text: "A guided setup with a readiness score, so you can go live in under 30 minutes.",
  },
  {
    icon: "mdi-database-sync-outline",
    title: "Live product and customer data",
    text: "Connect your product and customer systems with mapping and preview, so answers use live stock, prices, and order status.",
  },
  {
    icon: "mdi-forum-outline",
    title: "Conversations and summaries",
    text: "Chats grouped into conversations with automatic summaries, plus WhatsApp 24-hour window handling.",
  },
  {
    icon: "mdi-shield-account-outline",
    title: "Verified customers",
    text: "Phone verification and signed sign-in from your app, so the bot can safely discuss a customer's own account.",
  },
  {
    icon: "mdi-lightning-bolt-outline",
    title: "Actions",
    text: "The bot can do things for customers, like extending a booking or sending a payment link, with confirmation first.",
  },
  {
    icon: "mdi-fire",
    title: "Lead scoring and follow-ups",
    text: "Hot leads are flagged automatically, and follow-up messages go out on rules you set.",
  },
  {
    icon: "mdi-cellphone-link",
    title: "SDKs for apps",
    text: "Add the chat to React and React Native apps, with native iOS and Android to follow.",
  },
];

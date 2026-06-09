import type { BlogPostEditorInput } from "./blog.js";
import { stripHtml } from "./blog.js";

export type PublicContentQualityStatus = "approved" | "needs_revision" | "hold";
export type PublicUserIntent = "informational" | "transactional" | "navigational" | "commercial";
export type PublicPageType =
  | "blog"
  | "service"
  | "calculator"
  | "comparison"
  | "home"
  | "hub"
  | "trust"
  | "help"
  | "legal"
  | "page";

export interface PublicContentSource {
  label: string;
  url: string;
  checkedAt: string | null;
}

export interface PublicContentContext {
  route: string;
  pageType: PublicPageType;
  audience: string[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  userIntent: PublicUserIntent;
  keyTopics: string[];
  officialSources: PublicContentSource[];
  author: { name: string; role?: string | null };
  reviewer?: {
    name: string;
    credentialName: string;
    credentialId: string;
    credentialAuthority?: string | null;
  } | null;
  editorialApproval?: { approvedBy: string; approvedAt: string } | null;
  qualityStatus: PublicContentQualityStatus;
}

export interface ContentQualityIssue {
  code: string;
  severity: "error" | "warning";
  message: string;
  route?: string;
  routes?: string[];
}

export function markDraftQualityIssuesAsWarnings(issues: ContentQualityIssue[]): ContentQualityIssue[] {
  return issues.map((item) => (item.severity === "warning" ? item : { ...item, severity: "warning" }));
}

export interface PublicContentEvaluationInput {
  context: PublicContentContext;
  title: string;
  description: string;
  content: string;
  schemaSteps?: string[];
  internalLinks?: string[];
  imageAlts?: string[];
  schemaTypes?: string[];
}

const UNSUPPORTED_REVIEW_PATTERNS = [
  /\bca[- ]reviewed\b/i,
  /\bca[- ]backed review\b/i,
  /\bca[- ]led review\b/i,
  /\bca[- ]led compliance review\b/i,
  /\breviewed by (?:a |our )?ca\b/i,
  /\bca review workflow\b/i,
  /\bca-led tax editorial team\b/i,
  /\bca myeca review desk\b/i,
];

const GENERIC_FILLER_PATTERNS = [
  /\bofficial source baseline\b/i,
  /\brelated myeca guide\b/i,
  /\bfinal takeaway\b/i,
  /\bcheck the official source before acting\b/i,
  /\bkeep document and bank records aligned\b/i,
  /\buse expert review where tax or scheme facts are unclear\b/i,
  /\bfor myeca readers\b/i,
  /\bthe people landing on this topic are usually\b/i,
  /\bmost searches behind this topic\b/i,
  /\bthe safest workflow is to avoid copying a random answer\b/i,
  /\btreat this as a document-readiness workflow\b/i,
  /\bthe reviewer should confirm the user profile\b/i,
  /\buse a ca or expert review\b/i,
  /\bwhat should i (?:check|verify) first for\b/i,
  /\bwhich official source (?:supports this|should i check for)\b/i,
  /\bwhat mismatch can delay\b/i,
  /\bwhen should i get help with\b/i,
  /\bneed case-specific review\b/i,
  /\bthose records should expose gaps in\b/i,
  /\bdo not rely on an older screenshot or summary\b/i,
  /\bshould be based on those records, not a promised result\b/i,
  /\busers and crawlers\b/i,
  /\bsearch crawlers?\b/i,
  /\bcrawler-visible\b/i,
  /\bcomplete topical path\b/i,
  /\bcompetitor capture page\b/i,
  /\bwhere myeca should win\b/i,
  /\bthe conversion angle\b/i,
  /\bcommercial .* pillar\b/i,
  /\bmyeca should (?:describe|explain|present|make)\b/i,
  /\breddit-style\b/i,
  /\bca technical notes\b/i,
  /\bca technical review note\b/i,
  /\breviewer handoff note\b/i,
  /\binternal review checklist\b/i,
  /\bfor this specific topic\b/i,
  /\bfor this topic\b/i,
  /\bthe reviewer (?:must|should)\b/i,
  /\bminimum evidence file\b/i,
  /\bthe central decision is\b/i,
  /\bthat note matters because\b/i,
  /\bthese related guides cover the nearest filing or record questions\b/i,
  /\bto test or organize\b/i,
  /\bconfirm the current instruction, eligibility rule, form, or portal step\b/i,
  /\buse [^.!?\n]{3,100} for the right task\b/i,
  /\bwhat to verify before acting\b/i,
  /\bmove to a documented next step\b/i,
  /\bon mye?ca\.in:\s*indian tax, gst, startup, and compliance guidance with practical next steps\b/i,
  /\bscope, records, and exclusions\b/i,
  /\bdelay risks and escalation\b/i,
  /\binputs and records to verify\b/i,
  /\blimits and next action\b/i,
  /\bmethod and evidence\b/i,
  /\bchoose based on fit\b/i,
  /\bapplications can stall when identity, bank, land, education, business, or local-authority records\b/i,
  /\bwrite down the intended outcome, relevant period, and the record supporting each material answer\b/i,
  /\bwhich [^?]{3,120} answer must be corrected, disclosed, or clarified before the (?:application|return) can be completed\b/i,
  /\bbecause an acknowledgement records submission, while\b/i,
  /\bthe submitted (?:application|return), and the acknowledgement in the same evidence file\b/i,
  /\beligibility story\b/i,
  /\bcurrent source checked\b/i,
  /\bread the answer against the facts behind\b/i,
  /\bapply that rule by completing\b/i,
  /\buse the evidence table and checklist to support\b/i,
  /\bin a real [^,.]{3,100} file, follow the same sequence\b/i,
  /\buse the related route that addresses this unresolved point\b/i,
  /\bthe links below\b/i,
  /\bthese routes help\b/i,
  /\bdocument-based professional help\b/i,
  /\bfor this [^.!?\n]{3,100} position\b/i,
  /\bcomplete the [^.!?\n]{3,120} checks below\b/i,
  /\bfor [^,.!?\n]{3,120},\s+apply that rule\b/i,
  /\bmye?ca helps\b/i,
  /\bchoose the [^.!?\n]{3,100} route that matches the current document and deadline\b/i,
  /\bthe fastest option visible on a portal is not necessarily the correct\b/i,
  /\bfor ([^,.]{4,100}),\s*for \1,/i,
  /\ba (?:taxpayers|employees|families|users|farmers|applicants|students|businesses)\b[^.!?]{0,120}\bfinds that\b/i,
  /\bdepends on the relevant figures and period\b/i,
  /\bneeded to show that you\b/i,
  /\bcalculation or decision method that explains how you\b/i,
  /\bproof showing that you\b/i,
  /\bcurrent rules and records that agree\b/i,
  /\bdefensible record trail\b/i,
  /\bdocumented filing position\b/i,
  /\bcheck [^.!?\n]{3,120} against the questions below\b/i,
  /\bone defensible treatment\b/i,
  /\bsupport the same material eligibility facts\b/i,
  /\bmaterial eligibility facts\b/i,
  /\bresponsible authority\b/i,
  /\bresponsible portal\b/i,
  /\bsource check:\s/i,
  /\breconciliation:\s/i,
  /\barchive:\s/i,
  /\bshould begin with the requested outcome\b/i,
  /\buses the same case facts and period\b/i,
  /\bshould be checked against the relevant records\b/i,
  /\bshould lead to the relevant calculator\b/i,
  /\bassess the intended result\b/i,
  /\brecord assumptions, unresolved differences, and the next action\b/i,
  /\buse the same [^.!?\n]{3,160} case facts and current public terms throughout the review\b/i,
  /\ba headline price or feature list may not show\b/i,
  /\ba material mismatch, missing fact, or changed rule can alter the estimate, filing route, or service scope\b/i,
  /\btreat estimates as planning inputs, not final filing advice\b/i,
  /\bescalate unresolved record conflicts before submission\b/i,
  /\bis [^?]{3,140} currently listed as an eligible applicant group\b/i,
  /\bidentify the same applicant, activity, or asset\b/i,
  /\beligibility or outcome answer is supported by\b/i,
  /\bsupport the amount, date, parties, and underlying activity recorded in the file\b/i,
  /\bconfirm that names, numbers, dates, and profile details agree with the application or return\b/i,
  /\brecheck the current instructions on\b/i,
  /\bmatch [^.!?\n]{3,120} with [^.!?\n]{3,120} and explain any remaining difference\b/i,
  /\bkeep [^.!?\n]{3,180} and the final [^.!?\n]{3,100} acknowledgement together\b/i,
  /\breconcile the supporting records, resolve material mismatches\b/i,
  /\bconfirm the notified AY 2026-27 return route\b/i,
  /\bconfirm the AY 2026-27 form and schedules for\b/i,
  /\bwith the submitted return and acknowledgement\b/i,
  /\bmust answer its own application question\b/i,
  /\blive authority route and their own records\b/i,
  /\bnot a copied checklist\b/i,
  /\bevidence set around four questions\b/i,
  /\bthe decision to record is\b/i,
  /\bsource checks should answer four practical points\b/i,
  /\bsimple pre-submission check by tracing one material\b/i,
  /\bshould not be used to hide a conflict\b/i,
  /\bcomplete upload set containing\b/i,
  /\blive route asks for a fact absent from\b/i,
  /\bca review is included in every plan\b/i,
  /\ba ca reviews before filing\b/i,
  /\bdocuments are reviewed by professionals\b/i,
  /\bopen the current official source and map the rule to the relevant income head, taxpayer type, and dates\b/i,
  /\bbuild the [^.!?\n]{3,100} file from source records, computation notes, challans, statements, and declarations before filing or payment\b/i,
  /\buse the [^.!?\n]{3,100} working to determine whether the ITR form, schedule, tax payment, TDS\/TCS, or disclosure route changes\b/i,
  /\bclose the [^.!?\n]{3,100} file with the final return, acknowledgement, e-verification proof, and supporting working papers\b/i,
  /\brequires current official instructions and the actual source records; the final treatment or outcome still depends on the facts\b/i,
  /\bidentify whether [^.!?\n]{3,140} affects AY 2026-27 filing, Tax Year 2026-27 compliance, or both\b/i,
  /\bis useful only when the application can trace [^.!?\n]{3,140} back to it\b/i,
  /\bthen test the same applicant file against\b/i,
  /\bshould support the live application answer about\b/i,
  /\bresolve any incomplete or inconsistent [^.!?\n]{3,140} detail before submission\b/i,
  /\bsave the checked [^.!?\n]{3,140} evidence with the final acknowledgement\b/i,
  /\buse the format and issuing record named in the current authority instruction\b/i,
  /\bdocument-based professional review through a documented review\b/i,
  /\bbusinesses should and freelancers\b/i,
  /\bdecisions need organised records,\s*(?:weigh up|compare)\b/i,
  /\bneed a return that can be traced back to the records, not merely a plausible prefilled figure\b/i,
  /\bassign a specific purpose to [^.!?\n]{3,160}, and every other return record\b/i,
  /\bthe records available for [^.!?\n]{3,120} cannot settle the return without complete facts\b/i,
  /\ba useful [^.!?\n]{3,100} file lets\b/i,
  /\bthe review covers\b/i,
  /\bshould write a short [^.!?\n]{3,120} conclusion before opening the final return\b/i,
  /\bis the practical question in this return\b/i,
  /^##\s+.+:\s+worked check using\s+.+$/im,
  /^##\s+.+:\s+final filing check\s*$/im,
  /\bquestions before acting\b/i,
  /\brelated routes\b/i,
  /\bthe immediate record question is\b/i,
  /\bshould end by naming the record owner, unresolved difference, and next authority action\b/i,
  /\bseparate missing evidence from a factual conflict before submission\b/i,
  /\bgive each record one job\b/i,
  /\breproduce the submitted [^.!?\n]{3,140} answer from\b/i,
  /\borganising the [^.!?\n]{3,140} evidence does not predict\b/i,
  /\bescalate unresolved [^.!?\n]{3,140} evidence to\b/i,
  /^##\s+.+:\s+(?:authority instruction|evidence map|correction path|sources checked|retention and limits)\s*$/im,
  /\bshould have one reporting treatment supported by the source records\b/i,
  /\bfiling work is incomplete until this question is resolved\b/i,
  /\bdo not combine unrelated [^.!?\n]{3,120} discrepancies into one balancing figure\b/i,
  /\btrail should let the taxpayer explain the position without recreating the entire exercise from memory\b/i,
  /\brequires a filing position supported by\b/i,
  /\bdecide the reporting treatment\b/i,
  /\banswers one part of\b/i,
  /\brecord the person, period, amount, and fact it establishes\b/i,
  /\bstart with a falsifiable conclusion\b/i,
  /\bportal entry is useful only when\b/i,
  /\bfrom the perspective of\b/i,
  /\bwithin the current [^.!?\n]{3,100} task\b/i,
  /^during [^,\n]{3,80} follow-up,\s/im,
  /\bthe authority still controls the decision and timing\b/i,
  /\bread the file from a reviewer\b/i,
  /\bidentify the smallest evidence set\b/i,
];

const LEGACY_BATCH_TEMPLATE_PATTERNS = [
  /:\s*the decision to make\b/i,
  /\bevidence should answer these four questions\b/i,
  /:\s*compare [^.\n]{3,120} with the other records\b/i,
  /:\s*a record-based scenario\b/i,
  /:\s*practical next actions\b/i,
  /:\s*records to retain\b/i,
  /\bbefore relying on the answer\b/i,
  /\bthe submitted record\b/i,
];

const NOUN_SWAPPED_BATCH_PATTERNS = [
  /\bstarting evidence:\s*which fact or amount comes from\b/i,
  /^##\s+.+\s+evidence:\s+.+$/im,
  /^##\s+.+\s+mismatch:\s+.+\s+versus\s+.+$/im,
  /^##\s+.+\s+pause points:\s+.+$/im,
  /^##\s+.+\s+example:\s+reconcile\s+.+$/im,
  /^##\s+.+\s+submission:\s+from\s+.+\s+to the\s+(?:application|return)$/im,
  /^##\s+.+\s+file:\s+retain\s+.+$/im,
  /\bthe practical risk is reporting a plausible figure that cannot be reconstructed later\b/i,
  /\bmay need more than one official page because\b/i,
  /\ba clean [^.!?\n]{3,80} file separates\b/i,
  /\bthe prefill is a prompt to investigate, not a decision\b/i,
  /\bdocument-based review when a material issue remains unresolved\b/i,
  /\bacceptance, processing time, and outcome remain controlled\b/i,
  /\bneed complete facts before this guide can settle the filing position\b/i,
  /\bas the starting record, not the complete answer\b/i,
  /\bconfirm the notified AY 2026-27 form and schedule on\b/i,
  /\bconnect the receipt, payment, or credit trail to\b/i,
  /\btrace the relevant amount, date, parties, and activity from\b/i,
  /\bwhy each record needs a distinct role in the working for\b/i,
  /\bbefore figures are entered, so the selected form, schedules, and tax-credit claims follow\b/i,
  /\bshould check the live [^.!?\n]{3,120} route on\b/i,
  /\bestablish the ownership, use, location, payment, or eligibility fact that\b/i,
  /\bconfirm the account holder, branch details, and account used for any\b/i,
  /\bestablish the applicant status or condition required for the\b/i,
  /\buse [^.!?\n]{3,120} to compare reported entries with [^.!?\n]{3,120} and investigate omissions, duplication, or classification differences\b/i,
  /\bconfirm the live route and applicant fit\b/i,
  /\bconflict:\s+decide before upload\b/i,
  /\bcase check:\s+reconstruct the answer\b/i,
  /\bverify the authority route\b/i,
  /\bevidence limits and retention\b/i,
  /^##\s+where .+ needs a document-based review\s*$/im,
  /^##\s+.+:\s+before closing the .+ file\s*$/im,
  /\borganise [^.!?\n]{0,100}records,\s*(?:compare|weigh up) [^.!?\n]{0,100}(?:routes|regimes),\s*(?:build|prepare) [^.!?\n]{0,80}checklists\b/i,
  /\brebuild the relevant transactions from\b/i,
  /\bsettle disagreements before choosing the form and classification\b/i,
  /\blabel each remaining record by the separate question it answers\b/i,
  /\bdo not let [^.!?\n]{3,120} replace the fact established by\b/i,
  /\btrace a difference between [^.!?\n]{3,120} through\b/i,
  /\bwhere [^.!?\n]{3,160} do not reconcile, identify the matching entry\b/i,
  /\bdetermines which form and schedule need checking\b/i,
  /\bmust support the same filing treatment;\s*pause if\b/i,
  /^##\s+close the .+ working file\s*$/im,
];

const MALFORMED_COPY_PATTERNS = [
  /\.;/,
  /;\s*;/,
  /(^|[^.])\.\.($|[^.])/,
  /\.\s+raises a question\b/i,
  /[.!?]#{2,6}\s/,
  /^#{2,6}[^\n]+\n(?!\n|$)/m,
  /\bfor i [a-z][^.!?]{8,180}[.!?]\s+(?:can|should|do|does|is|are|will)\b/i,
  /\bwhen does i [a-z][^?]{8,180}\?/i,
  /\b(?:to )?complete (?:checking|matching|reconciling|filing|using|deciding|reporting|separating|preserving|documenting|reviewing|explaining|computing)\b/i,
  /\bthe filing working should show why (?:confirm|check|compute|select|match|read|identify|download|collect|use)\b/i,
  /\bthe (?:match|check|identify|list|review|compare|use|select|classify)\b[^.!?]{0,80}\bcheck raises a question\b/i,
  /\bfollow it with (?:identify|check|match|classify|select|list|review|compare|use)\b/i,
  /\breconcile that result by (?:identify|check|match|classify|select|list|review|compare|use)\b/i,
  /\bif the (?:checking|matching|reconciling|filing|using|deciding|reporting|separating|preserving|documenting|reviewing|explaining|computing)\b[^.!?]{3,160}\bquestion remains unresolved\b/i,
  /\bshould (?:checking|choosing|combining|reporting|matching|separating|classifying|preserving|documenting|disclosing|reviewing|explaining|using|computing|connecting|deciding|reconciling|filing|keeping|building|organising|organizing|understanding|preparing|identifying|splitting|verifying)\b/i,
  /\bdoes [^?]{0,80}\b(?:records|credits|details|returns|receipts|statements)\s+explain\b/i,
  /\bcorrect (?!the source data\b)[^.!?]{3,80} source data\b/i,
  /\bfor [^,\n]{3,120},\s+for [^,\n]{3,120},\s+/i,
  /\bfor [^,\n]{3,120},\s+aY 2026-27\b/,
  /\bwhat does [^?]{1,100}\b(?:records|statements|returns|invoices|credits|details)\s+(?:establish|show|prove)\b/i,
  /\bdoes [^?]{1,100}\b(?:records|statements|returns|invoices|credits|details)\s+support\b/i,
  /\bsuppose (?:the )?[^.!?]{0,80}\b(?:records|statements|returns|invoices|credits|details)\s+(?:supports|does not)\b/i,
  /\bwhen [^.!?]{1,120}\b(?:records|statements|returns|credits|details)\s+does not agree\b/i,
  /\b(?:records|statements|returns|credits|details)\s+leaves the\b/i,
  /\b(?:records|returns|credits|details|statements|receipts|proofs)[ \t]+(?:establishes|confirms|challenges|explains|supports)\b/i,
  /(?:^|[.!?;:>"']\s*|\n\s*(?:[-*]\s*)?|\|\s*)(?!Each\s+of\b)(?![A-Za-z]+ing\b)(?:[A-Za-z][\w&/-]*\s+){0,4}(?:records|notes|details|statements|returns|figures|receipts|payments|expenses|invoices|documents)\s+(?:changes|supports|answers|establishes|confirms|requires|shows|belongs|affects|is)\b/m,
  /\bwhy (?:[a-z0-9&/-]+\s+){0,4}(?:records|notes|details|statements|returns|figures|receipts|payments|expenses|invoices|documents)\s+is included\b/i,
  /(?:^|[.!?;]\s+)(?:these|those|the)?\s*(?:records|returns|credits|details|statements|receipts|proofs|contracts|invoices|orders|documents|filings|transactions|prescriptions)\s+is\b/im,
  /\b(?:before|when|whether|if|what)\s+(?:the\s+)?(?:[a-z-]+\s+){0,4}(?:records|returns|credits|details|statements|receipts|proofs|contracts|invoices|orders|documents|filings|transactions|prescriptions)\s+(?:is|was|has|does|changes|belongs|plays)\b/i,
  /\b(?:records|returns|credits|details|statements|receipts|proofs|contracts|invoices|orders|documents|filings|transactions|prescriptions|reports|papers)\s+should[^.!?\n;]{3,180};\s*(?:compare|reconcile)\s+it\b/i,
  /\b(?:AIS|PAN|Aadhaar|Form\s+\w+|bank\s+(?:credits?|statements?)|[a-z-]+\s+(?:records?|returns?|statements?|certificates?|receipts?|details?|proofs?))\s+and\s+(?:AIS|PAN|Aadhaar|Form\s+\w+|bank\s+(?:credits?|statements?)|[a-z-]+\s+(?:records?|returns?|statements?|certificates?|receipts?|details?|proofs?))\s+(?:establishes|confirms|challenges|explains|supports)\b/i,
  /\ban completed\b/i,
  /\ba (?:employees|consultants|contributors|investors|traders|users|taxpayers|applicants|recipients|owners|borrowers|families|founders|sellers|farmers|households|businesses)\b/i,
  /\bevidence for whether\b/i,
  /\bfor the (?:employees|consultants|contributors|investors|traders|users|taxpayers|applicants|recipients|owners|borrowers|families|founders|sellers|farmers|households|businesses)\b[^.!?\n]{0,80}\b(?:date|amount|counterparty|charges|classification)\b/i,
  /\ba (?:[a-z-]+\s+){0,4}(?:employees|consultants|contributors|investors|traders|users|taxpayers|applicants|recipients|owners|borrowers|families|founders|sellers|farmers|households|businesses)\s+(?:filing|mismatch|return|working|record|decision)\b/i,
  /\b(?:taxpayers|employees|consultants|investors|users|owners|borrowers|families|founders|sellers|farmers|households|businesses)\b[^.!?\n]{0,100}\brequires from the underlying record\b/i,
  /\u00e2(?:\u20ac|\u0080)/i,
];

const GENERIC_EVIDENCE_EXPLANATION_PATTERNS = [
  /\bcompare this record with the current official requirements and resolve any inconsistent detail\b/i,
  /\btrace relevant receipts, payments, refunds, or benefit entries and explain unrelated transactions separately\b/i,
];

const GENERIC_AUDIENCE_PATTERNS = [
  /^(?:both|individuals|businesses)$/i,
  /^people (?:in india )?(?:using|seeking|estimating|comparing|researching|evaluating)\b/i,
  /^mye?ca users (?:reviewing|seeking help with|looking for practical support through|checking)\b/i,
  /^prospective mye?ca customers reviewing\b/i,
  /\bworking on\b[^.]{3,160}\bwho need to\b/i,
  /^applicants, families, farmers, students, workers, and small businesses\b/i,
  /\bis for indian taxpayers or businesses preparing the required records and deciding whether to proceed$/i,
  /\bagainst the programme's current eligibility, document, and follow-up requirements\b/i,
  /\bwho need to confirm obligations, records, and the next filing action\b/i,
  /\bdeciding how .+ affects receipts, expenses, tax credits, and return selection\b/i,
  /\bdeciding how .+ affects indian disclosure and foreign-tax records\b/i,
  /\bdeciding how to report .+ in ay 2026-27 and which records support the return\b/i,
  /\bchoosing the correct ay 2026-27 return route for .+ and reconciling records before submission\b/i,
  /\bresolving .+ from the filed return, portal communication, tax-credit records, and response deadline\b/i,
  /\bcomparing how .+ changes the computation and the evidence needed for the selected position\b/i,
];

const EXPECTED_SCHEMA_BY_PAGE_TYPE: Partial<Record<PublicPageType, string[]>> = {
  blog: ["Article", "BlogPosting"],
  service: ["Service"],
  calculator: ["SoftwareApplication"],
  comparison: ["WebPage"],
};

const MINIMUM_VISIBLE_WORDS_BY_PAGE_TYPE: Record<PublicPageType, number> = {
  blog: 650,
  service: 225,
  calculator: 150,
  comparison: 180,
  home: 200,
  hub: 150,
  trust: 150,
  help: 150,
  legal: 120,
  page: 150,
};

export interface PublicContentSourceAuthority {
  key: string;
  label: string;
  url: string;
  acceptedHosts: string[];
}

const SOURCE_AUTHORITIES = {
  incomeTax: {
    key: "income-tax",
    label: "Income Tax Department",
    url: "https://www.incometax.gov.in/",
    acceptedHosts: ["incometax.gov.in"],
  },
  gst: {
    key: "gst",
    label: "GST Portal",
    url: "https://www.gst.gov.in/",
    acceptedHosts: ["gst.gov.in"],
  },
  mca: {
    key: "mca",
    label: "Ministry of Corporate Affairs",
    url: "https://www.mca.gov.in/",
    acceptedHosts: ["mca.gov.in"],
  },
  startupIndia: {
    key: "startup-india",
    label: "Startup India",
    url: "https://www.startupindia.gov.in/",
    acceptedHosts: ["startupindia.gov.in"],
  },
  udyam: {
    key: "udyam",
    label: "Udyam Registration Portal",
    url: "https://udyamregistration.gov.in/",
    acceptedHosts: ["udyamregistration.gov.in"],
  },
  fssai: {
    key: "fssai",
    label: "Food Safety and Standards Authority of India",
    url: "https://www.fssai.gov.in/",
    acceptedHosts: ["fssai.gov.in"],
  },
  labour: {
    key: "labour",
    label: "Ministry of Labour and Employment",
    url: "https://labour.gov.in/",
    acceptedHosts: ["labour.gov.in"],
  },
  epfo: {
    key: "epfo",
    label: "Employees' Provident Fund Organisation",
    url: "https://www.epfindia.gov.in/",
    acceptedHosts: ["epfindia.gov.in"],
  },
  esic: {
    key: "esic",
    label: "Employees' State Insurance Corporation",
    url: "https://www.esic.gov.in/",
    acceptedHosts: ["esic.gov.in"],
  },
  pfrda: {
    key: "pfrda",
    label: "Pension Fund Regulatory and Development Authority",
    url: "https://www.pfrda.org.in/",
    acceptedHosts: ["pfrda.org.in"],
  },
  sebi: {
    key: "sebi",
    label: "Securities and Exchange Board of India",
    url: "https://www.sebi.gov.in/",
    acceptedHosts: ["sebi.gov.in"],
  },
  rbi: {
    key: "rbi",
    label: "Reserve Bank of India",
    url: "https://www.rbi.org.in/",
    acceptedHosts: ["rbi.org.in"],
  },
  indiaPost: {
    key: "india-post",
    label: "Department of Posts - Small Savings Schemes",
    url: "https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx",
    acceptedHosts: ["indiapost.gov.in"],
  },
  ipIndia: {
    key: "ip-india",
    label: "Intellectual Property India",
    url: "https://ipindia.gov.in/",
    acceptedHosts: ["ipindia.gov.in"],
  },
  nabcb: {
    key: "nabcb",
    label: "National Accreditation Board for Certification Bodies",
    url: "https://nabcb.qci.org.in/",
    acceptedHosts: ["nabcb.qci.org.in"],
  },
  indiaGov: {
    key: "india-gov",
    label: "National Portal of India",
    url: "https://www.india.gov.in/",
    acceptedHosts: ["india.gov.in"],
  },
} satisfies Record<string, PublicContentSourceAuthority>;

const ROUTE_SOURCE_AUTHORITY_OVERRIDES: Record<string, PublicContentSourceAuthority[]> = {
  "/capital-gains-import": [SOURCE_AUTHORITIES.incomeTax, SOURCE_AUTHORITIES.sebi],
  "/calculators/capital-gains": [SOURCE_AUTHORITIES.incomeTax, SOURCE_AUTHORITIES.sebi],
  "/calculators/elss": [SOURCE_AUTHORITIES.incomeTax, SOURCE_AUTHORITIES.sebi],
  "/calculators/penalty": [SOURCE_AUTHORITIES.incomeTax, SOURCE_AUTHORITIES.gst],
  "/compliance-calendar": [SOURCE_AUTHORITIES.incomeTax, SOURCE_AUTHORITIES.gst],
  "/itr-season-2026/capital-gains-broker-statement-checklist": [
    SOURCE_AUTHORITIES.incomeTax,
    SOURCE_AUTHORITIES.sebi,
  ],
  "/learn/guide/stock-capital-gains-tax": [SOURCE_AUTHORITIES.incomeTax, SOURCE_AUTHORITIES.sebi],
  "/services/iso-certification": [SOURCE_AUTHORITIES.nabcb],
  "/services/msme-registration": [SOURCE_AUTHORITIES.udyam],
  "/services/msme-udyam-registration": [SOURCE_AUTHORITIES.udyam],
  "/services/notice-compliance": [SOURCE_AUTHORITIES.incomeTax],
  "/services/professional-tax": [SOURCE_AUTHORITIES.indiaGov],
  "/services/startup-india": [SOURCE_AUTHORITIES.startupIndia],
  "/services/startup-india-registration": [SOURCE_AUTHORITIES.startupIndia],
  "/services/trade-license": [SOURCE_AUTHORITIES.indiaGov],
  "/services/trademark-registration": [SOURCE_AUTHORITIES.ipIndia],
};

export function expectedOfficialSourceAuthorities(
  context: Pick<PublicContentContext, "route" | "pageType">,
): PublicContentSourceAuthority[] {
  if (
    context.pageType === "blog" ||
    context.pageType === "comparison" ||
    context.pageType === "home" ||
    context.pageType === "help" ||
    context.pageType === "legal" ||
    context.pageType === "trust"
  ) {
    return [];
  }

  const route = context.route.toLowerCase().split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (ROUTE_SOURCE_AUTHORITY_OVERRIDES[route]) return ROUTE_SOURCE_AUTHORITY_OVERRIDES[route];

  if (/(?:^|\/)(?:gst|hsn)(?:-|\/|$)/.test(route)) return [SOURCE_AUTHORITIES.gst];
  if (/(?:fssai|food)/.test(route)) return [SOURCE_AUTHORITIES.fssai];
  if (/(?:^|\/)esi(?:-|\/|$)/.test(route)) return [SOURCE_AUTHORITIES.esic];
  if (/(?:^|\/)epf(?:-|\/|$)/.test(route)) return [SOURCE_AUTHORITIES.epfo];
  if (/(?:labour|gratuity)/.test(route)) return [SOURCE_AUTHORITIES.labour];
  if (/(?:nps|pension)/.test(route)) return [SOURCE_AUTHORITIES.pfrda];
  if (/(?:ppf|small-savings)/.test(route)) return [SOURCE_AUTHORITIES.indiaPost];
  if (/(?:loan|emi|foreign-remittance|\/fd(?:-|\/|$)|\/rd(?:-|\/|$)|inflation)/.test(route)) {
    return [SOURCE_AUTHORITIES.rbi];
  }
  if (/(?:investment|wealth|elss|sip|swp|lumpsum)/.test(route)) return [SOURCE_AUTHORITIES.sebi];
  if (/(?:company|director|dsc|roc|llp|^\/startup(?:\/|$)|^\/startup-services$)/.test(route)) {
    return [SOURCE_AUTHORITIES.mca];
  }
  if (/(?:tax|itr|income|tds|refund|form-?16|ais|hra|deductions|regime|salary|pan-card|tan-registration)/.test(route)) {
    return [SOURCE_AUTHORITIES.incomeTax];
  }

  return [];
}

function sourceHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function sourceMatchesAuthority(source: PublicContentSource, authority: PublicContentSourceAuthority): boolean {
  const hostname = sourceHostname(source.url);
  return Boolean(hostname && authority.acceptedHosts.some((acceptedHost) =>
    hostname === acceptedHost || hostname.endsWith(`.${acceptedHost}`)));
}

function isMyeCaFirstPartySource(source: PublicContentSource): boolean {
  const hostname = sourceHostname(source.url);
  return hostname === "myeca.in" || Boolean(hostname?.endsWith(".myeca.in"));
}

function issue(
  code: string,
  severity: ContentQualityIssue["severity"],
  message: string,
  route?: string,
): ContentQualityIssue {
  return { code, severity, message, ...(route ? { route } : {}) };
}

function hasVerifiedReviewer(context: PublicContentContext): boolean {
  return Boolean(
    context.reviewer?.name.trim() &&
    context.reviewer?.credentialName.trim() &&
    context.reviewer?.credentialId.trim(),
  );
}

function isValidDate(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(new Date(value).getTime()));
}

function isOlderThan(value: string | null | undefined, days: number): boolean {
  if (!isValidDate(value)) return false;
  return Date.now() - new Date(value as string).getTime() > days * 24 * 60 * 60 * 1000;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function normalizeComparableText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function repeatedLocalPhrase(content: string, phraseWords = 8, minimumOccurrences = 4): string | null {
  const words = normalizeComparableText(stripHtml(content)).split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();

  for (let index = 0; index + phraseWords <= words.length; index += 1) {
    const phrase = words.slice(index, index + phraseWords).join(" ");
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }

  return [...counts.entries()].find(([, count]) => count >= minimumOccurrences)?.[0] ?? null;
}

function excessiveRepeatedTopicPhrase(
  content: string,
  phraseWords = 4,
  minimumOccurrences = 8,
  minimumWordsPerOccurrence = 55,
): { phrase: string; count: number } | null {
  const ignoredPhrases = new Set([
    "income tax department income",
    "income tax department ay",
    "ay 2026 27 itr",
  ]);
  const words = normalizeComparableText(stripHtml(content)).split(/\s+/).filter(Boolean);
  const counts = new Map<string, number>();

  for (let index = 0; index + phraseWords <= words.length; index += 1) {
    const phrase = words.slice(index, index + phraseWords).join(" ");
    if (ignoredPhrases.has(phrase)) continue;
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }

  const repeated = [...counts.entries()]
    .filter(([, count]) => count >= minimumOccurrences && words.length / count < minimumWordsPerOccurrence)
    .sort((left, right) => right[1] - left[1])[0];

  return repeated ? { phrase: repeated[0], count: repeated[1] } : null;
}

function excessiveRepeatedHyphenatedLabel(
  content: string,
  minimumOccurrences = 8,
): { phrase: string; count: number } | null {
  const counts = new Map<string, number>();

  for (const phrase of stripHtml(content).toLowerCase().match(/\b[a-z]+(?:-[a-z]+){2,}\b/g) ?? []) {
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
  }

  const repeated = [...counts.entries()]
    .filter(([, count]) => count >= minimumOccurrences)
    .sort((left, right) => right[1] - left[1])[0];

  return repeated ? { phrase: repeated[0], count: repeated[1] } : null;
}

function excessivePrimaryTopicRepetition(
  content: string,
  primaryKeyword: string,
  minimumOccurrences = 20,
  minimumWordsPerOccurrence = 35,
): { phrase: string; count: number } | null {
  const ignoredKeywordTokens = new Set([
    "2026",
    "2027",
    "ay",
    "checklist",
    "documents",
    "eligibility",
    "guide",
    "itr",
    "scheme",
    "tax",
  ]);
  const keywordTokens = normalizeComparableText(primaryKeyword)
    .split(/\s+/)
    .filter((token) => token && !ignoredKeywordTokens.has(token));
  const phrase = keywordTokens.slice(0, 2).join(" ");
  if (phrase.split(/\s+/).length < 2) return null;

  const normalizedContent = normalizeComparableText(stripHtml(content));
  const words = normalizedContent.split(/\s+/).filter(Boolean);
  const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const count = [...normalizedContent.matchAll(new RegExp(`\\b${escapedPhrase}\\b`, "g"))].length;
  if (count < minimumOccurrences || words.length / count >= minimumWordsPerOccurrence) return null;

  return { phrase, count };
}

export function evaluatePublicContent(input: PublicContentEvaluationInput): ContentQualityIssue[] {
  const { context } = input;
  const route = context.route;
  const text = stripHtml(input.content);
  const copyText = input.content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|h[1-6]|td|th)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
  const issues: ContentQualityIssue[] = [];

  if (!route.startsWith("/")) {
    issues.push(issue("invalid_route", "error", "Public content context must include an absolute route.", route));
  }
  if (!context.audience.length || !context.audience.some((value) => value.trim())) {
    issues.push(issue("missing_audience", "error", "Define the specific audience for this route.", route));
  }
  if (context.audience.some((value) =>
    GENERIC_AUDIENCE_PATTERNS.some((pattern) => pattern.test(value.trim())))) {
    issues.push(issue("generic_audience", "error", "Replace generated route-name audiences with a real user group.", route));
  }
  if (!context.primaryKeyword.trim()) {
    issues.push(issue("missing_primary_keyword", "error", "Define a primary keyword for this route.", route));
  }
  if (!context.secondaryKeywords.length) {
    issues.push(issue("missing_secondary_keywords", "error", "Define at least one supporting search phrase.", route));
  }
  if (!context.keyTopics.length) {
    issues.push(issue("missing_key_topics", "error", "Define the decisions or topics this route must cover.", route));
  }
  if (unique(context.keyTopics.map(normalizeComparableText)).length !== context.keyTopics.length) {
    issues.push(issue("duplicate_key_topic", "error", "Remove repeated key topics from the public content context.", route));
  }
  if (!context.author.name.trim()) {
    issues.push(issue("missing_author", "error", "Use a truthful author or editorial-team attribution.", route));
  }
  if (!input.title.trim() || !input.description.trim()) {
    issues.push(issue("missing_metadata", "error", "Title and description must both be present.", route));
  }
  if (input.title.trim().length > 90 || input.description.trim().length > 220) {
    issues.push(issue("severely_truncated_metadata", "error", "Metadata is likely to be severely truncated.", route));
  }

  if (!context.officialSources.length) {
    issues.push(issue(
      "missing_official_sources",
      "error",
      "Add a dated primary source that supports the route's material or first-party claims.",
      route,
    ));
  }
  if (context.officialSources.some((source) => !source.label.trim() || !/^https?:\/\//i.test(source.url))) {
    issues.push(issue("invalid_official_source", "error", "Official sources need a label and an HTTP(S) URL.", route));
  }
  if (context.officialSources.some((source) => !isValidDate(source.checkedAt))) {
    issues.push(issue("missing_source_check_date", "error", "Record when each official source was last checked.", route));
  }
  if (context.officialSources.some((source) => isOlderThan(source.checkedAt, 366))) {
    issues.push(issue("stale_official_source", "error", "Recheck official sources that are more than one year old.", route));
  } else if (context.officialSources.some((source) => isOlderThan(source.checkedAt, 180))) {
    issues.push(issue("aging_official_source", "warning", "Recheck official sources that are more than six months old.", route));
  }
  const expectedSourceAuthorities = expectedOfficialSourceAuthorities(context);
  const firstPartySourceRequired =
    expectedSourceAuthorities.length === 0 &&
    ["home", "help", "legal", "trust", "page", "service", "calculator"].includes(context.pageType);
  if (
    context.officialSources.length &&
    firstPartySourceRequired &&
    !context.officialSources.some(isMyeCaFirstPartySource)
  ) {
    issues.push(issue(
      "missing_first_party_source",
      "error",
      "Add a dated MyeCA policy, service-scope, methodology, or support source for this first-party route.",
      route,
    ));
  }
  if (
    context.officialSources.length &&
    expectedSourceAuthorities.length &&
    !context.officialSources.some((source) =>
      expectedSourceAuthorities.some((authority) => sourceMatchesAuthority(source, authority)))
  ) {
    issues.push(issue(
      "irrelevant_official_source",
      "error",
      `Use a route-relevant authority such as ${expectedSourceAuthorities.map((authority) => authority.label).join(" or ")}.`,
      route,
    ));
  }

  const expectedSchemaTypes = EXPECTED_SCHEMA_BY_PAGE_TYPE[context.pageType];
  if (
    expectedSchemaTypes &&
    input.schemaTypes?.length &&
    !input.schemaTypes.some((schemaType) => expectedSchemaTypes.includes(schemaType))
  ) {
    issues.push(issue(
      "inappropriate_schema",
      "error",
      `Use ${expectedSchemaTypes.join(" or ")} schema for this ${context.pageType} route.`,
      route,
    ));
  }

  const reviewText = [input.title, input.description, input.content, context.author.name, context.author.role ?? ""].join(" ");
  if (!hasVerifiedReviewer(context) && UNSUPPORTED_REVIEW_PATTERNS.some((pattern) => pattern.test(reviewText))) {
    issues.push(issue(
      "unsupported_ca_review_claim",
      "error",
      "Remove the CA-review claim or record the named reviewer's verified credential.",
      route,
    ));
  }
  const editorialText = [input.title, input.description, input.content, ...(input.schemaSteps ?? [])].join(" ");
  const genericFillerMatch = GENERIC_FILLER_PATTERNS
    .map((pattern) => editorialText.match(pattern)?.[0])
    .find(Boolean);
  if (genericFillerMatch) {
    issues.push(issue(
      "generic_generated_filler",
      "error",
      `Replace generated-template language with route-specific guidance: "${genericFillerMatch}".`,
      route,
    ));
  }
  const legacyBatchTemplateMatches = LEGACY_BATCH_TEMPLATE_PATTERNS.filter((pattern) =>
    pattern.test(editorialText));
  if (legacyBatchTemplateMatches.length >= 3) {
    issues.push(issue(
      "legacy_batch_template",
      "error",
      `Rewrite the legacy generated article structure; ${legacyBatchTemplateMatches.length} template signatures remain.`,
      route,
    ));
  }
  const nounSwappedBatchMatches = NOUN_SWAPPED_BATCH_PATTERNS.filter((pattern) =>
    pattern.test(editorialText));
  if (nounSwappedBatchMatches.length >= 3) {
    issues.push(issue(
      "noun_swapped_batch_template",
      "error",
      `Rewrite the noun-swapped article structure; ${nounSwappedBatchMatches.length} repeated editorial signatures remain.`,
      route,
    ));
  }
  const malformedCopyMatch = MALFORMED_COPY_PATTERNS
    .map((pattern) => copyText.match(pattern)?.[0])
    .find(Boolean);
  if (malformedCopyMatch) {
    issues.push(issue(
      "malformed_generated_copy",
      "error",
      `Fix malformed or noun-swapped copy: "${malformedCopyMatch.replace(/\s+/g, " ").trim()}".`,
      route,
    ));
  }
  if (GENERIC_EVIDENCE_EXPLANATION_PATTERNS.some((pattern) => pattern.test(editorialText))) {
    issues.push(issue(
      "generic_evidence_explanation",
      "error",
      "Explain why each record matters for this specific decision instead of using a reusable evidence-table sentence.",
      route,
    ));
  }
  const localOpeningCounts = new Map<string, number>();
  normalizedSentences(input.content, 60)
    .map((sentence) => normalizeComparableText(sentence).split(/\s+/).slice(0, 3).join(" "))
    .filter((opening) => opening.split(/\s+/).length === 3 && /^for\s/.test(opening))
    .forEach((opening) => localOpeningCounts.set(opening, (localOpeningCounts.get(opening) ?? 0) + 1));
  const repetitiveLocalOpening = [...localOpeningCounts.entries()].find(([, count]) => count >= 4);
  if (repetitiveLocalOpening) {
    issues.push(issue(
      "repetitive_local_prose_opening",
      "error",
      `Rewrite repeated "${repetitiveLocalOpening[0]}..." sentence openings so each section begins with its actual decision or evidence.`,
      route,
    ));
  }
  const repetitiveLocalPhrase = context.pageType === "blog" ? null : repeatedLocalPhrase(input.content);
  if (repetitiveLocalPhrase) {
    issues.push(issue(
      "repetitive_local_phrase",
      "error",
      `Rewrite the repeated phrase "${repetitiveLocalPhrase}..."; route-specific copy should not repeat a long task or keyword string four or more times.`,
      route,
    ));
  }
  const repetitiveTopicPhrase = context.pageType === "blog"
    ? excessiveRepeatedTopicPhrase(input.content)
    : null;
  if (repetitiveTopicPhrase) {
    issues.push(issue(
      "excessive_repeated_topic_phrase",
      "error",
      `Rewrite the repeated topic phrase "${repetitiveTopicPhrase.phrase}"; it appears ${repetitiveTopicPhrase.count} times and reads like keyword substitution.`,
      route,
    ));
  }
  const repetitiveScaffoldingPhrase = context.pageType === "blog"
    ? excessiveRepeatedHyphenatedLabel(input.content)
    : null;
  if (repetitiveScaffoldingPhrase) {
    issues.push(issue(
      "excessive_local_scaffolding_phrase",
      "error",
      `Rewrite the repeated scaffolding phrase "${repetitiveScaffoldingPhrase.phrase}"; it appears ${repetitiveScaffoldingPhrase.count} times in this article.`,
      route,
    ));
  }
  const repetitivePrimaryTopic = context.pageType === "blog"
    ? excessivePrimaryTopicRepetition(input.content, context.primaryKeyword)
    : null;
  if (repetitivePrimaryTopic) {
    issues.push(issue(
      "excessive_primary_topic_repetition",
      "error",
      `Use the primary topic naturally; "${repetitivePrimaryTopic.phrase}" appears ${repetitivePrimaryTopic.count} times in this article.`,
      route,
    ));
  }
  const comparableTitle = normalizeComparableText(input.title);
  const comparableText = normalizeComparableText(text);
  if (comparableTitle.split(/\s+/).length >= 4) {
    const titleOccurrences = comparableText.split(comparableTitle).length - 1;
    if (titleOccurrences >= 4) {
      issues.push(issue(
        "excessive_title_repetition",
        "error",
        "Use the full page title sparingly; repeated title substitution reads like generated filler.",
        route,
      ));
    }
  }
  const comparablePrimaryKeyword = normalizeComparableText(context.primaryKeyword);
  if (comparablePrimaryKeyword.length >= 18 && comparablePrimaryKeyword.split(/\s+/).length >= 3) {
    const primaryKeywordOccurrences = comparableText.split(comparablePrimaryKeyword).length - 1;
    const comparableWordCount = comparableText.split(/\s+/).filter(Boolean).length;
    if (primaryKeywordOccurrences >= 6 && comparableWordCount / primaryKeywordOccurrences < 120) {
      issues.push(issue(
        "excessive_primary_keyword_repetition",
        "error",
        "Use the exact primary keyword sparingly; repeated keyword substitution reads like generated filler.",
        route,
      ));
    }
  }

  const headingCount = (input.content.match(/<h[2-4]\b|^#{2,4}\s/gim) ?? []).length;
  if (headingCount < 2 && context.pageType !== "home") {
    issues.push(issue("weak_heading_structure", "warning", "Use descriptive sections that reflect the user's decisions.", route));
  }
  const markdownHeadings = [...input.content.matchAll(/^#{2,4}\s+(.+?)\s*$/gim)].map((match) =>
    normalizeComparableText(match[1]));
  const htmlHeadings = [...input.content.matchAll(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/gi)].map((match) =>
    normalizeComparableText(stripHtml(match[1])));
  const comparableHeadings = [...markdownHeadings, ...htmlHeadings].filter(Boolean);
  if (new Set(comparableHeadings).size < comparableHeadings.length) {
    issues.push(issue("duplicate_section_heading", "error", "Use a distinct, descriptive label for every section.", route));
  }
  const minimumWords = MINIMUM_VISIBLE_WORDS_BY_PAGE_TYPE[context.pageType];
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < minimumWords) {
    issues.push(issue(
      "thin_visible_content",
      "error",
      `Add meaningful crawler-visible content; this ${context.pageType} route has ${wordCount} words and needs at least ${minimumWords} before it can pass.`,
      route,
    ));
  }
  const minimumInternalLinks = context.pageType === "blog" ? 4 : 2;
  if (unique(input.internalLinks ?? []).length < minimumInternalLinks && !["legal", "home"].includes(context.pageType)) {
    issues.push(issue(
      "weak_internal_linking",
      "error",
      `Add at least ${minimumInternalLinks} relevant, descriptive internal links for this ${context.pageType} route.`,
      route,
    ));
  }
  if ((input.imageAlts ?? []).some((alt) => !alt.trim())) {
    issues.push(issue("missing_image_alt", "error", "Every meaningful content image needs descriptive alternative text.", route));
  }

  if (context.qualityStatus === "approved" && !context.editorialApproval) {
    issues.push(issue("missing_editorial_approval", "error", "Approved content needs a recorded human approval.", route));
  }
  if (context.editorialApproval && (!context.editorialApproval.approvedBy.trim() || !isValidDate(context.editorialApproval.approvedAt))) {
    issues.push(issue("invalid_editorial_approval", "error", "Editorial approval needs an approver and valid approval date.", route));
  }

  return issues;
}

function normalizedParagraphs(content: string): string[] {
  const htmlParagraphs = [...content.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => stripHtml(match[1]));
  const candidates = htmlParagraphs.length
    ? htmlParagraphs
    : content
        .replace(/\r\n/g, "\n")
        .split(/\n\s*\n/)
        .filter((block) => !/^\s*(?:#{1,6}|[-*+] |\d+[.)] |>|[|])/.test(block));

  return unique(
    candidates
      .map((paragraph) => stripHtml(paragraph).replace(/\s+/g, " ").trim())
      .filter((paragraph) => paragraph.length >= 120),
  );
}

export function evaluateDuplicateParagraphs(
  records: Array<{ route: string; content: string }>,
  allowedParagraphs: string[] = [],
): ContentQualityIssue[] {
  const allowed = new Set(allowedParagraphs.map((paragraph) => paragraph.replace(/\s+/g, " ").trim().toLowerCase()));
  const occurrences = new Map<string, { paragraph: string; routes: string[] }>();

  for (const record of records) {
    for (const paragraph of normalizedParagraphs(record.content)) {
      const key = paragraph.toLowerCase();
      if (allowed.has(key)) continue;
      const existing = occurrences.get(key) ?? { paragraph, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(key, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= 3)
    .map((entry) => ({
      code: "duplicate_long_paragraph",
      severity: "error" as const,
      message: `A ${entry.paragraph.length}-character paragraph appears unchanged across ${entry.routes.length} routes: "${entry.paragraph.slice(0, 120)}${entry.paragraph.length > 120 ? "..." : ""}"`,
      routes: entry.routes.sort(),
    }));
}

function normalizedContentShingles(content: string, shingleWords: number): Set<string> {
  const prose = content
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1");
  const words = normalizeComparableText(stripHtml(prose)).split(/\s+/).filter(Boolean);
  const shingles = new Set<string>();
  for (let index = 0; index <= words.length - shingleWords; index += 1) {
    shingles.add(words.slice(index, index + shingleWords).join(" "));
  }
  return shingles;
}

export function evaluateNearDuplicateContent(
  records: Array<{ route: string; content: string }>,
  minimumJaccard = 0.25,
  minimumContainment = 0.4,
  shingleWords = 5,
  minimumShingles = 20,
): ContentQualityIssue[] {
  const comparable = records.map((record) => ({
    route: record.route,
    shingles: normalizedContentShingles(record.content, shingleWords),
  }));
  const issues: ContentQualityIssue[] = [];

  for (let leftIndex = 0; leftIndex < comparable.length; leftIndex += 1) {
    const left = comparable[leftIndex];
    if (left.shingles.size < minimumShingles) continue;

    for (let rightIndex = leftIndex + 1; rightIndex < comparable.length; rightIndex += 1) {
      const right = comparable[rightIndex];
      if (right.shingles.size < minimumShingles) continue;

      let intersection = 0;
      const smaller = left.shingles.size <= right.shingles.size ? left.shingles : right.shingles;
      const larger = smaller === left.shingles ? right.shingles : left.shingles;
      for (const shingle of smaller) {
        if (larger.has(shingle)) intersection += 1;
      }

      const containment = intersection / smaller.size;
      const union = left.shingles.size + right.shingles.size - intersection;
      const jaccard = union ? intersection / union : 0;
      if (jaccard < minimumJaccard || containment < minimumContainment) continue;

      issues.push({
        code: "near_duplicate_content",
        severity: "error",
        routes: [left.route, right.route].sort(),
        message:
          `These routes share ${Math.round(containment * 100)}% of the smaller page's ${shingleWords}-word phrases ` +
          `(${Math.round(jaccard * 100)}% Jaccard similarity); rewrite the shared template around each route's actual user decision.`,
      });
    }
  }

  return issues;
}

function normalizedLongBlocks(content: string, minimumLength: number): string[] {
  const htmlBlocks = [...content.matchAll(/<(?:p|li)\b[^>]*>([\s\S]*?)<\/(?:p|li)>/gi)]
    .map((match) => match[1] ?? "");
  const markdownBlocks = [
    ...content
      .split(/\r?\n/)
      .filter((line) => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line))
      .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")),
    ...content
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .filter((block) => !/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|\||>)/.test(block)),
  ];

  return unique(
    (htmlBlocks.length ? htmlBlocks : markdownBlocks)
      .filter((block) => !/^\s*(?:\[[^\]]+\]\([^)]+\)|<a\b[^>]*>[\s\S]*<\/a>)\s*$/i.test(block))
      .map((block) => stripHtml(block.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")))
      .map((block) => block.replace(/[*_`]/g, "").replace(/\s+/g, " ").trim())
      .filter((block) => block.length >= minimumLength)
      .filter((block) => block.split(/\s+/).length >= 8),
  );
}

export function evaluateRepeatedLongBlocks(
  records: Array<{ route: string; content: string }>,
  allowedBlocks: string[] = [],
  minimumRoutes = 2,
  minimumLength = 80,
): ContentQualityIssue[] {
  const allowed = new Set(allowedBlocks.map((block) => block.replace(/\s+/g, " ").trim().toLowerCase()));
  const occurrences = new Map<string, { block: string; routes: string[] }>();

  for (const record of records) {
    for (const block of normalizedLongBlocks(record.content, minimumLength)) {
      const key = block.toLowerCase();
      if (allowed.has(key)) continue;
      const existing = occurrences.get(key) ?? { block, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(key, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_long_block",
      severity: "warning" as const,
      message: `An ${entry.block.length}-character content block appears unchanged across ${entry.routes.length} routes: "${entry.block.slice(0, 140)}${entry.block.length > 140 ? "..." : ""}"`,
      routes: entry.routes.sort(),
    }));
}

function normalizedReusableFragments(content: string): string[] {
  const htmlFragments = [...content.matchAll(/<(?:p|li|td|th|h[2-4])\b[^>]*>([\s\S]*?)<\/(?:p|li|td|th|h[2-4])>/gi)]
    .map((match) => match[1]);
  const plain = (htmlFragments.length ? htmlFragments.join("\n") : content)
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:#{1,6}\s+|[-*+]\s*\[[^\]]+\]\([^)]+\)\s*$)/.test(line))
    .join("\n")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/\r\n/g, "\n");
  const fragments = plain
    .split(/\n+/)
    .flatMap((line) => line.split("|"))
    .flatMap((fragment) => fragment.split(/(?<=[.!?])\s+/))
    .map((fragment) => stripHtml(fragment)
      .replace(/^\s*(?:#{1,6}|[-*+]|\d+[.)]|>)\s*/, "")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim())
    .filter((fragment) => fragment.length >= 120 && fragment.length <= 260)
    .filter((fragment) => fragment.split(/\s+/).length >= 8)
    .filter((fragment) => !/^https?:\/\//i.test(fragment));

  return unique(fragments);
}

export function evaluateRepeatedBoilerplate(
  records: Array<{ route: string; content: string }>,
  allowedFragments: string[] = [],
  minimumRoutes = 8,
): ContentQualityIssue[] {
  const allowed = new Set(allowedFragments.map((fragment) => fragment.replace(/\s+/g, " ").trim().toLowerCase()));
  const occurrences = new Map<string, { fragment: string; routes: string[] }>();

  for (const record of records) {
    for (const fragment of normalizedReusableFragments(record.content)) {
      const key = fragment.toLowerCase();
      if (allowed.has(key)) continue;
      const existing = occurrences.get(key) ?? { fragment, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(key, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_boilerplate",
      severity: "error" as const,
      message: `A sentence-length fragment appears unchanged across ${entry.routes.length} routes: "${entry.fragment.slice(0, 140)}${entry.fragment.length > 140 ? "..." : ""}"`,
      routes: entry.routes.sort(),
    }));
}

function normalizedSentences(content: string, minimumLength: number): string[] {
  const proseOnly = content
    .replace(/<table\b[\s\S]*?<\/table>/gi, " ")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, " ")
    .replace(/<(?:ul|ol)\b[\s\S]*?<\/(?:ul|ol)>/gi, " ")
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|\|)/.test(line))
    .join("\n");
  const plain = stripHtml(
    proseOnly
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")
      .replace(/\r\n/g, "\n"),
  );

  return unique(
    plain
      .split(/(?<=[.!?])(?:\s+|$)/)
      .map((sentence) => sentence.replace(/^\s*(?:#{1,6}|[-*+]|\d+[.)]|>)\s*/, "").replace(/\s+/g, " ").trim())
      .filter((sentence) => sentence.length >= minimumLength)
      .filter((sentence) => sentence.split(/\s+/).length >= 8)
      .filter((sentence) => !/^written by mye?ca editorial team\b/i.test(sentence)),
  );
}

export function evaluateRepeatedProseOpenings(
  records: Array<{ route: string; content: string }>,
  allowedOpenings: string[] = [],
  minimumRoutes = 12,
  openingWords = 7,
): ContentQualityIssue[] {
  const allowed = new Set(allowedOpenings.map(normalizeComparableText));
  const occurrences = new Map<string, { opening: string; routes: string[] }>();

  for (const record of records) {
    const routeOpenings = unique(
      normalizedSentences(record.content, 90)
        .map((sentence) => normalizeComparableText(sentence).split(/\s+/).slice(0, openingWords).join(" "))
        .filter((opening) => opening.split(/\s+/).length === openingWords)
        .filter((opening) => !allowed.has(opening))
        .filter((opening) => !/^(?:written by|published|updated|reviewed by)\b/.test(opening)),
    );
    for (const opening of routeOpenings) {
      const existing = occurrences.get(opening) ?? { opening, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(opening, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_prose_opening",
      severity: "error" as const,
      message: `The prose opening "${entry.opening}..." appears across ${entry.routes.length} routes; rewrite the shared sentence pattern around each route's actual decision.`,
      routes: entry.routes.sort(),
    }));
}

function normalizedListItems(content: string, minimumLength: number): string[] {
  const markdownItems = content
    .split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line))
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""));
  const htmlItems = [...content.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => match[1] ?? "");

  return unique(
    [...markdownItems, ...htmlItems]
      .filter((item) => !/^\s*(?:\[[^\]]+\]\([^)]+\)|<a\b[^>]*>[\s\S]*<\/a>)\s*$/i.test(item))
      .map((item) => stripHtml(item.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")))
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter((item) => item.length >= minimumLength)
      .filter((item) => item.split(/\s+/).length >= 8),
  );
}

export function evaluateRepeatedListOpenings(
  records: Array<{ route: string; content: string }>,
  allowedOpenings: string[] = [],
  minimumRoutes = 8,
  openingWords = 7,
): ContentQualityIssue[] {
  const allowed = new Set(allowedOpenings.map(normalizeComparableText));
  const occurrences = new Map<string, { opening: string; routes: string[] }>();

  for (const record of records) {
    const routeOpenings = unique(
      normalizedListItems(record.content, 50)
        .map((item) => normalizeComparableText(item).split(/\s+/).slice(0, openingWords).join(" "))
        .filter((opening) => opening.split(/\s+/).length === openingWords)
        .filter((opening) => !allowed.has(opening)),
    );
    for (const opening of routeOpenings) {
      const existing = occurrences.get(opening) ?? { opening, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(opening, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_list_opening",
      severity: "error" as const,
      message: `The list-item opening "${entry.opening}..." appears across ${entry.routes.length} routes; rewrite list guidance around each route's actual task.`,
      routes: entry.routes.sort(),
    }));
}

export function evaluateRepeatedSentences(
  records: Array<{ route: string; content: string }>,
  allowedSentences: string[] = [],
  minimumRoutes = 3,
  minimumLength = 60,
): ContentQualityIssue[] {
  const allowed = new Set(allowedSentences.map((sentence) => sentence.replace(/\s+/g, " ").trim().toLowerCase()));
  const occurrences = new Map<string, { sentence: string; routes: string[] }>();

  for (const record of records) {
    for (const sentence of normalizedSentences(record.content, minimumLength)) {
      const key = sentence.toLowerCase();
      if (allowed.has(key)) continue;
      const existing = occurrences.get(key) ?? { sentence, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(key, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_sentence",
      severity: "error" as const,
      message: `A sentence appears unchanged across ${entry.routes.length} routes: "${entry.sentence.slice(0, 140)}${entry.sentence.length > 140 ? "..." : ""}"`,
      routes: entry.routes.sort(),
    }));
}

function normalizedStructuredFragments(content: string, minimumLength: number, minimumWords: number): string[] {
  const withoutNavigation = content.replace(/<nav\b[\s\S]*?<\/nav>/gi, " ");
  const markdownSegments = withoutNavigation
    .split(/\r?\n/)
    .filter((line) => /^\s*(?:[-*+]\s+|\d+[.)]\s+|\|.+\|)\s*/.test(line))
    .filter((line) => !/^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line));
  const htmlSegments = [
    ...[...withoutNavigation.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => match[1] ?? ""),
    ...[...withoutNavigation.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1] ?? ""),
  ];
  const fragments = new Set<string>();

  for (const segment of [...markdownSegments, ...htmlSegments]) {
    let editorialSegment = segment;
    if (/\[Open source\]\(/i.test(segment)) {
      editorialSegment = segment.replace(/^\s*\|[^|]+\|/, "| ");
    } else if (/<a\b[^>]*>\s*Open source\s*<\/a>/i.test(segment)) {
      editorialSegment = segment.replace(/<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/i, " ");
    }
    const plainText = stripHtml(editorialSegment.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, " "))
      // Reused descriptive anchors and official-source names are navigation,
      // not editorial instructions. Evaluate the surrounding structured copy.
      .replace(/\[([^\]]+)\]\([^)]+\)/g, " ")
      .replace(/\|/g, ". ");
    for (const clause of plainText.split(/(?<=[.!?])\s+/)) {
      const fragment = normalizeComparableText(clause);
      if (fragment.length >= minimumLength && fragment.split(/\s+/).length >= minimumWords) fragments.add(fragment);
    }
  }

  return [...fragments];
}

export function evaluateRepeatedStructuredFragments(
  records: Array<{ route: string; content: string }>,
  allowedFragments: string[] = [],
  minimumRoutes = 8,
  minimumLength = 45,
  minimumWords = 8,
): ContentQualityIssue[] {
  const allowed = new Set(allowedFragments.map(normalizeComparableText));
  const occurrences = new Map<string, string[]>();

  for (const record of records) {
    for (const fragment of normalizedStructuredFragments(record.content, minimumLength, minimumWords)) {
      if (allowed.has(fragment)) continue;
      const routes = occurrences.get(fragment) ?? [];
      if (!routes.includes(record.route)) routes.push(record.route);
      occurrences.set(fragment, routes);
    }
  }

  return [...occurrences.entries()]
    .filter(([, routes]) => routes.length >= minimumRoutes)
    .map(([fragment, routes]) => ({
      code: "repeated_structured_fragment",
      severity: "error" as const,
      message: `A structured-copy fragment appears across ${routes.length} routes: "${fragment}"`,
      routes: routes.sort(),
    }));
}

function normalizedHeadingSequence(content: string): string[] {
  const markdownHeadings = [...content.matchAll(/^#{2,4}\s+(.+)$/gim)].map((match) => match[1]);
  const htmlHeadings = [...content.matchAll(/<h[2-4]\b[^>]*>([\s\S]*?)<\/h[2-4]>/gi)].map((match) => stripHtml(match[1]));
  return (htmlHeadings.length ? htmlHeadings : markdownHeadings)
    .map(normalizeComparableText)
    .filter(Boolean);
}

export function evaluateRepeatedHeadingLabels(
  records: Array<{ route: string; content: string }>,
  allowedHeadings: string[] = [],
  minimumRoutes = 8,
): ContentQualityIssue[] {
  const allowed = new Set(allowedHeadings.map(normalizeComparableText));
  const occurrences = new Map<string, { heading: string; routes: string[] }>();

  for (const record of records) {
    for (const heading of unique(normalizedHeadingSequence(record.content))) {
      if (allowed.has(heading)) continue;
      const existing = occurrences.get(heading) ?? { heading, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(heading, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_generic_heading",
      severity: "error" as const,
      message: `The generic section heading "${entry.heading}" appears across ${entry.routes.length} routes; use a problem-specific heading or remove the repeated module.`,
      routes: entry.routes.sort(),
    }));
}

export function evaluateRepeatedHeadingPrefixes(
  records: Array<{ route: string; content: string }>,
  allowedPrefixes: string[] = [],
  minimumRoutes = 8,
  prefixWords = 3,
): ContentQualityIssue[] {
  const allowed = new Set(allowedPrefixes.map(normalizeComparableText));
  const occurrences = new Map<string, { prefix: string; routes: string[] }>();

  for (const record of records) {
    const routePrefixes = unique(
      normalizedHeadingSequence(record.content)
        .map((heading) => heading.split(/\s+/).slice(0, prefixWords).join(" "))
        .filter((prefix) => prefix.split(/\s+/).length === prefixWords)
        .filter((prefix) => !allowed.has(prefix)),
    );
    for (const prefix of routePrefixes) {
      const existing = occurrences.get(prefix) ?? { prefix, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(prefix, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_heading_prefix",
      severity: "error" as const,
      message: `The heading prefix "${entry.prefix}..." appears across ${entry.routes.length} routes; replace the shared template with a topic-specific section label.`,
      routes: entry.routes.sort(),
    }));
}

function normalizedTableRows(content: string, minimumLength: number): string[] {
  const markdownRows = content
    .split(/\r?\n/)
    .filter((line) => /^\s*\|.+\|\s*$/.test(line))
    .filter((line) => !/^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line));
  const htmlRows = [...content.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => match[1] ?? "");

  return unique(
    [...markdownRows, ...htmlRows]
      .map((row) => stripHtml(row)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\|/g, " ")
        .replace(/\s+/g, " ")
        .trim())
      // Repeating the same official citation is expected when several articles
      // rely on one primary source. Catch repeated editorial rows instead.
      .filter((row) => !/\bopen source\s*$/i.test(row))
      .filter((row) => row.length >= minimumLength)
      .filter((row) => row.split(/\s+/).length >= 8),
  );
}

export function evaluateRepeatedTableRows(
  records: Array<{ route: string; content: string }>,
  allowedRows: string[] = [],
  minimumRoutes = 8,
  minimumLength = 60,
): ContentQualityIssue[] {
  const allowed = new Set(allowedRows.map(normalizeComparableText));
  const occurrences = new Map<string, { row: string; routes: string[] }>();

  for (const record of records) {
    for (const row of normalizedTableRows(record.content, minimumLength)) {
      const key = normalizeComparableText(row);
      if (allowed.has(key)) continue;
      const existing = occurrences.get(key) ?? { row, routes: [] };
      if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
      occurrences.set(key, existing);
    }
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_table_row",
      severity: "error" as const,
      message: `A table row appears unchanged across ${entry.routes.length} routes: "${entry.row.slice(0, 140)}${entry.row.length > 140 ? "..." : ""}"`,
      routes: entry.routes.sort(),
    }));
}

export function evaluateRepeatedHeadingSequences(
  records: Array<{ route: string; content: string }>,
  minimumRoutes = 5,
  minimumHeadings = 5,
): ContentQualityIssue[] {
  const occurrences = new Map<string, { headings: string[]; routes: string[] }>();

  for (const record of records) {
    const headings = normalizedHeadingSequence(record.content);
    if (headings.length < minimumHeadings) continue;
    const key = headings.join(" | ");
    const existing = occurrences.get(key) ?? { headings, routes: [] };
    if (!existing.routes.includes(record.route)) existing.routes.push(record.route);
    occurrences.set(key, existing);
  }

  return [...occurrences.values()]
    .filter((entry) => entry.routes.length >= minimumRoutes)
    .map((entry) => ({
      code: "repeated_heading_sequence",
      severity: "error" as const,
      message: `The same ${entry.headings.length}-section outline appears across ${entry.routes.length} routes; vary the decision structure to match each topic.`,
      routes: entry.routes.sort(),
    }));
}

export function blogEditorInputToContentContext(input: BlogPostEditorInput): PublicContentContext {
  const reviewer =
    input.reviewerName && input.reviewerCredentialName && input.reviewerCredentialId
      ? {
          name: input.reviewerName,
          credentialName: input.reviewerCredentialName,
          credentialId: input.reviewerCredentialId,
          credentialAuthority: input.reviewerCredentialAuthority ?? null,
        }
      : null;
  const editorialApproval =
    input.editorialApprovedBy && input.editorialApprovedAt
      ? { approvedBy: input.editorialApprovedBy, approvedAt: input.editorialApprovedAt }
      : null;

  return {
    route: `/blog/${input.slug}`,
    pageType: "blog",
    audience: input.targetAudience ? [input.targetAudience] : input.audience ? [input.audience] : [],
    primaryKeyword: input.primaryKeyword ?? "",
    secondaryKeywords: input.secondaryKeywords ?? [],
    userIntent: input.userIntent ?? "informational",
    keyTopics: input.keyTopics?.length ? input.keyTopics : input.keyHighlights,
    officialSources: input.sourceLinks.map((source) => ({
      label: source.label,
      url: source.url,
      checkedAt: source.checkedAt ?? null,
    })),
    author: { name: input.authorName ?? "MyeCA Editorial Team", role: input.authorRole ?? null },
    reviewer,
    editorialApproval,
    qualityStatus: input.qualityStatus,
  };
}

export function evaluateBlogPublishability(input: BlogPostEditorInput): ContentQualityIssue[] {
  if (input.status !== "published") return [];

  const issues = evaluatePublicContent({
    context: blogEditorInputToContentContext(input),
    title: input.seoTitle || input.title,
    description: input.seoDescription || input.excerpt || "",
    content: input.content,
    internalLinks: [
      ...(input.serviceSlug ? [`/services/${input.serviceSlug}`] : []),
      ...(input.calculatorSlug ? [`/${input.calculatorSlug}`] : []),
      ...input.relatedPostIds.map((id) => `/blog/${id}`),
    ],
  });

  if (input.qualityStatus !== "approved") {
    issues.push(issue("unapproved_publish", "error", "Only content with approved quality status can be published.", `/blog/${input.slug}`));
  }
  if (!input.editorialApprovedBy || !input.editorialApprovedAt) {
    issues.push(issue("human_approval_required", "error", "Publishing requires recorded human editorial approval.", `/blog/${input.slug}`));
  }
  if (input.qualityStatus === "hold") {
    issues.push(issue("hold_route_publish", "error", "Content on hold cannot be published.", `/blog/${input.slug}`));
  }
  if ((input.reviewedBy || input.reviewedAt) && !(input.reviewerName && input.reviewerCredentialName && input.reviewerCredentialId)) {
    issues.push(issue(
      "unsupported_reviewer_attribution",
      "error",
      "Generic review attribution cannot be published without a named reviewer and verified credential.",
      `/blog/${input.slug}`,
    ));
  }

  return issues;
}

export class ContentQualityError extends Error {
  readonly issues: ContentQualityIssue[];

  constructor(issues: ContentQualityIssue[]) {
    super(`Content cannot be published: ${issues.map((item) => item.message).join(" ")}`);
    this.name = "ContentQualityError";
    this.issues = issues;
  }
}

export function assertBlogPublishable(input: BlogPostEditorInput): void {
  const hardIssues = evaluateBlogPublishability(input).filter((item) => item.severity === "error");
  if (hardIssues.length) throw new ContentQualityError(hardIssues);
}

export function shouldIndexPublicContent(status: PublicContentQualityStatus): boolean {
  return status !== "hold";
}

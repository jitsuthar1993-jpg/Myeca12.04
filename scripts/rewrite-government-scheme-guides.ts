import fs from "node:fs/promises";
import path from "node:path";
import { governmentSchemeEditorialDepth } from "./government-scheme-editorial-depth";
import { buildSchemeTargetAudience } from "./lib/blog-audience-metadata";

type SourceLink = {
  label?: string;
  url?: string;
  checkedAt?: string | null;
};

type Frontmatter = {
  title?: string;
  description?: string;
  slug?: string;
  modifiedAt?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  steps?: string[];
  excerpt?: string;
  seoDescription?: string;
  keyHighlights?: string[];
  keyTopics?: string[];
  relatedPostIds?: string[];
  sourceLinks?: SourceLink[];
  qualityStatus?: string;
  [key: string]: unknown;
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
const modifiedAt = "2026-06-08T00:00:00.000Z";
const editorialLabels: Record<string, string> = {
  "government-scheme-2026-apprenticeship-india-registration-checklist": "Apprenticeship application",
  "government-scheme-2026-caste-certificate-scholarship-loan-checklist": "Category-benefit application",
  "government-scheme-2026-national-career-service-profile-checklist": "Employment-profile application",
  "government-scheme-2026-ration-card-one-nation-one-ration-card-checklist": "Food-entitlement portability review",
  "government-scheme-2026-soil-health-card-record-checklist": "Farm nutrient report review",
};

const routeNotes: Record<string, string> = {
  "government-scheme-2026-aadhaar-update-itr-scheme-checklist":
    "An Aadhaar correction should be planned around the field that is wrong: name, date of birth, address, mobile, or another identifier. Check how that field appears on PAN, the income-tax account, bank records, and any scheme application that will use Aadhaar later; correcting one record does not automatically update the others.",
  "government-scheme-2026-abha-health-id-medical-record-guide":
    "An ABHA number helps link digital health interactions, but it is not a substitute for prescriptions, bills, diagnostic reports, or insurance papers. Keep medical-expense and treatment records in their original context, and check consent and identity details before linking or sharing a health record.",
  "government-scheme-2026-aicte-pragati-saksham-scholarship-guide":
    "A scholarship file should show the student's current course, recognised institution, admission status, family-income period, and bank holder without contradictions. Institution verification can be as important as the student's upload, so retain the submitted academic details and any verification response.",
  "government-scheme-2026-apprenticeship-india-registration-checklist":
    "An apprenticeship profile should accurately state education, skills, location, and contact details before it is matched with an employer. Keep certificates behind each qualification claim, and use a bank account belonging to the applicant when the programme or employer asks for payment details.",
  "government-scheme-2026-atal-pension-yojana-bank-mandate-checklist":
    "Before enrolment, trace the subscriber's age, bank mandate, contribution instruction, and nominee details to the same person. A successful first debit does not prove that every later contribution or nominee field is correct, so preserve the enrolment record and review account entries.",
  "government-scheme-2026-ayushman-bharat-pmjay-card-eligibility-checklist":
    "A PM-JAY check starts with beneficiary and household records rather than a promise of hospital cover. Confirm the family entry and accepted identity route on the official portal, then keep the card or reference details separate from hospital bills and treatment records.",
  "government-scheme-2026-caste-certificate-scholarship-loan-checklist":
    "A category certificate must belong to the same applicant and use the name and category relied on in the scholarship or loan form. Check the issuing authority, certificate number, validity or usage instruction where shown, and any family or domicile record requested by the receiving portal.",
  "government-scheme-2026-central-sector-scholarship-college-checklist":
    "A college scholarship application should reconcile marks, course and institution details, family-income proof, and the student's bank account. Save the application after institution verification so later payment or correction queries can be tied to the exact academic cycle.",
  "government-scheme-2026-cgtmse-credit-guarantee-msme-loan-checklist":
    "CGTMSE is connected to a lender-led credit process; a business should not treat the guarantee framework as a direct cash application. Prepare the loan request, enterprise identity, Udyam details, financial information, and lender correspondence as one consistent credit file.",
  "government-scheme-2026-digilocker-document-readiness-guide":
    "DigiLocker records can include issuer-fetched documents and user-uploaded copies, which do not always carry the same evidentiary weight. Check the issuer, document status, and linked identity before using a digital copy, and preserve the original or issuing record when the receiving authority asks for it.",
  "government-scheme-2026-disability-certificate-tax-scheme-checklist":
    "A disability certificate, medical records, and a tax or scheme claim answer different questions. Check the certificate issuer and applicant details, keep clinical records private and relevant, and match any deduction or benefit claim to the current form and supporting evidence.",
  "government-scheme-2026-eshram-card-registration-checklist":
    "An eShram registration should describe the worker's actual occupation and use the worker's own identity, mobile, and bank details. If occupation or account information changes later, keep the earlier registration and the update acknowledgement so the history remains traceable.",
  "government-scheme-2026-farmer-scheme-search-before-applying":
    "A farmer comparing schemes should first separate the need being addressed: income support, credit, insurance, equipment, energy, or another activity. Match the land, crop, bank, and Aadhaar records to the selected programme instead of uploading the same bundle to unrelated schemes.",
  "government-scheme-2026-gem-seller-registration-checklist":
    "A GeM seller profile should identify the same enterprise across PAN, bank, Udyam or GST records, and product information. Product claims and catalogue entries need their own evidence; business registration alone does not establish the specification, price, or ability to supply an item.",
  "government-scheme-2026-income-certificate-scholarship-checklist":
    "An income certificate should use the applicant, family definition, period, and issuing route required by the receiving scheme. Compare it with family details and available tax records, but do not assume a tax return automatically replaces the certificate requested by the portal.",
  "government-scheme-2026-jan-dhan-account-benefits-document-checklist":
    "A Jan Dhan account file should make the account holder, KYC route, mobile, nominee, and benefit-credit use clear. Keep the passbook or account record and review unexpected inactivity, failed credits, or nominee differences with the bank rather than relying on a general scheme summary.",
  "government-scheme-2026-kisan-credit-card-application-checklist":
    "A Kisan Credit Card request should connect the farmer, land or activity, crop plan, existing borrowing, and repayment account. A land record alone does not explain the credit need, and a bank statement alone does not establish the agricultural activity behind the request.",
  "government-scheme-2026-msme-samadhaan-delayed-payment-checklist":
    "A delayed-payment complaint needs a transaction chronology: Udyam status, purchase order, invoice, delivery evidence, due date, amount outstanding, and buyer communication. Build that chronology before filing so the complaint can be read without reconstructing the commercial record from memory.",
  "government-scheme-2026-mudra-loan-application-record-checklist":
    "A MUDRA loan request should explain the business activity, amount needed, use of funds, current cash flow, and repayment plan. Match quotations or invoices to the requested amount and keep the bank statement consistent with the business profile presented to the lender.",
  "government-scheme-2026-national-career-service-profile-checklist":
    "A National Career Service profile should make each education, experience, skill, and contact claim verifiable. Remove outdated claims, keep certificates behind the qualifications listed, and use a mobile and email account that the job seeker can access for employer contact.",
  "government-scheme-2026-national-scholarship-portal-student-checklist":
    "An NSP application should keep the student, institution, academic year, category or income record, and bank account aligned. Institution-level verification and later correction messages belong with the submitted form because payment problems often surface after the first upload.",
  "government-scheme-2026-nps-account-opening-checklist":
    "An NPS file should connect PAN or KYC, PRAN details, bank account, contributions, nominations, and tax records to the same subscriber. Preserve contribution receipts and annual statements separately from any deduction calculation used in the income-tax return.",
  "government-scheme-2026-nsap-pension-senior-citizen-checklist":
    "An NSAP pension application can involve age, income, household, local verification, identity, and bank records. Keep the local-body or state response with the application, because the bank account confirms payment details but does not establish every eligibility condition.",
  "government-scheme-2026-pmay-gramin-beneficiary-document-checklist":
    "A PMAY-Gramin file should distinguish beneficiary identification, household and housing status, local verification, and the bank account used for assistance. Keep inspection or local-body messages with the application instead of relying only on the beneficiary reference.",
  "government-scheme-2026-pmay-urban-home-loan-record-guide":
    "A PMAY-Urban review should connect household details, income proof, property papers, lender records, and any subsidy-related entry. The home-loan file and the programme application must describe the same borrower, property, amount, and stage of the transaction.",
  "government-scheme-2026-pmegp-loan-subsidy-application-checklist":
    "A PMEGP proposal should make the project, promoter, estimated cost, finance request, category or training record, and planned activity understandable to the reviewing body. Reconcile the project report with quotations and bank information before submission.",
  "government-scheme-2026-pm-fasal-bima-claim-document-checklist":
    "A crop-insurance claim should be tied to the insured season, crop, plot or activity, policy acknowledgement, loss intimation, and bank account. Keep proof of the intimation date and later survey or insurer communication; a general crop record cannot replace a claim chronology.",
  "government-scheme-2026-pmfme-food-processing-micro-unit-checklist":
    "A PMFME file should describe the food-processing activity, unit or applicant, project estimate, finance need, bank record, and relevant local approvals. Separate the business plan from licences or registrations, because each supports a different part of the proposal.",
  "government-scheme-2026-pmjjby-insurance-renewal-nominee-checklist":
    "A PMJJBY review should confirm enrolment, premium debit, account holder, nominee, and the records needed for a later claim. A debit entry may show payment but not prove that nominee or claim details are current, so keep the enrolment and bank evidence together.",
  "government-scheme-2026-pm-kisan-eligibility-tax-record-checklist":
    "A PM-KISAN file should reconcile the beneficiary entry with Aadhaar, the relevant land record, the bank passbook, and any income-tax-related status requested by the programme. Do not use the bank record to answer a land question or the land record to repair an identity mismatch.",
  "government-scheme-2026-pm-kusum-solar-pump-checklist":
    "A PM-KUSUM application should connect the farmer, land or site, existing pump or proposed asset, state-nodal route, and bank details. Keep vendor or technical records separate from ownership evidence and verify the state-specific channel before making a payment.",
  "government-scheme-2026-pmkvy-skill-training-registration-checklist":
    "A PMKVY learner should check the course, training centre, identity route, mobile access, and education proof before registration. Preserve attendance, assessment, and certificate records later; a registration acknowledgement alone does not establish completion or placement.",
  "government-scheme-2026-pm-matsya-sampada-fisheries-checklist":
    "A fisheries-support proposal should describe the applicant, activity, site or asset, project cost, bank position, and permissions relevant to the project. Reconcile the project report with the actual activity records before presenting the finance or support request.",
  "government-scheme-2026-pmsby-accident-insurance-checklist":
    "A PMSBY file should show the enrolled account, premium debit, nominee, coverage-period record, and documents required if a claim arises. Keep the debit proof, but do not treat it as a substitute for current enrolment or claim evidence.",
  "government-scheme-2026-pm-shram-yogi-maandhan-readiness-guide":
    "A PM-SYM pension file should connect the worker's age, occupation and income details, Aadhaar, bank mandate, mobile, and contribution record. Review debits after enrolment and keep nominee or account corrections with the original application.",
  "government-scheme-2026-pm-surya-ghar-rooftop-solar-readiness-guide":
    "A rooftop-solar file should connect the electricity consumer, premises or roof, vendor proposal, installation records, and bank account. Verify the portal and vendor route before payment, and keep the consumer number consistent through application and follow-up.",
  "government-scheme-2026-pm-svanidhi-street-vendor-loan-checklist":
    "A PM SVANidhi request should connect the vendor certificate or local-body reference, applicant identity, bank account, mobile, borrowing, and repayment record. Preserve later digital-payment or repayment evidence separately from the original loan application.",
  "government-scheme-2026-pm-ujjwala-lpg-connection-checklist":
    "A PM Ujjwala file should align the household, accepted identity route, ration or family record, bank account, and distributor interaction. Keep the connection or application reference with later distributor messages; a bank account does not establish household status.",
  "government-scheme-2026-pm-vishwakarma-registration-document-checklist":
    "A PM Vishwakarma registration should accurately describe the artisan or craft activity and use the applicant's own Aadhaar, mobile, bank, and local-verification records. Keep training, toolkit, credit, or later programme records separate from the initial registration.",
  "government-scheme-2026-ppf-tax-record-checklist-ay-2026-27":
    "A PPF tax file should reconcile passbook entries, deposit receipts, interest information, withdrawals or loans, and the deduction amount used in the return. Keep account transactions by financial year so a tax claim is not based on the wrong period.",
  "government-scheme-2026-ration-card-one-nation-one-ration-card-checklist":
    "A ration-card and portability review should begin with the household record, family members, state details, Aadhaar-seeding status where applicable, and the transaction or grievance reference. Correct family or identity differences through the state route instead of duplicating household entries.",
  "government-scheme-2026-scss-senior-citizen-savings-checklist":
    "An SCSS file should connect age or retirement evidence, PAN, deposit record, bank or post-office account, interest entries, and TDS information. Preserve the opening and interest records by year so the income-tax return can be reconciled later.",
  "government-scheme-2026-soil-health-card-record-checklist":
    "A soil-health record is useful when the sample, field or land reference, crop, test result, and advisory can be linked. Keep the sampling and advisory details with later farm decisions; the card should inform planning rather than serve as proof for unrelated ownership questions.",
  "government-scheme-2026-stand-up-india-loan-readiness-checklist":
    "A Stand-Up India loan file should explain the promoter category and ownership, proposed enterprise, project cost, finance request, and bank readiness. Match category and KYC records to the promoter and keep the project report consistent with the amount sought.",
  "government-scheme-2026-startup-india-recognition-checklist":
    "A Startup India recognition file should connect the legal entity, incorporation date, PAN, business activity, and innovation or improvement explanation. The pitch or innovation note should describe the same entity and product reflected in the incorporation records.",
  "government-scheme-2026-startup-india-seed-fund-readiness-guide":
    "A seed-fund application should connect recognition status, pitch, problem and solution, milestones, funding need, financial records, and team. Keep the version presented to an incubator or committee so later questions can be answered against the assessed proposal.",
  "government-scheme-2026-sukanya-samriddhi-account-checklist":
    "A Sukanya Samriddhi account file should connect the child, guardian, birth record, KYC, deposits, and tax-support documents. Keep deposit receipts by financial year and preserve any guardian or account correction with the original opening records.",
  "government-scheme-2026-udyam-registration-msme-checklist":
    "An Udyam registration should use the enterprise's correct Aadhaar-linked proprietor or authorised-person details, PAN, activity classification, GSTIN where applicable, and turnover information. Update source registrations before copying inconsistent data into the Udyam record.",
  "government-scheme-2026-umang-app-services-checklist":
    "UMANG is a channel for many services, so the relevant records depend on the department selected inside the app. Keep the mobile and identity login secure, verify the service-specific account, and save the acknowledgement from the department action rather than only the app screen.",
  "government-scheme-2026-women-entrepreneur-scheme-search-checklist":
    "A women-entrepreneur scheme search should separate programmes by promoter ownership, business stage, activity, location, funding need, and lender or department route. Compare official terms first, then prepare KYC, business proof, and bank records for the programme that actually fits.",
};

const routeDecisionNotes: Record<string, string> = {
  "government-scheme-2026-eshram-card-registration-checklist":
    "Treat occupation selection as a factual classification exercise. Write down the work actually performed, whether it is seasonal or regular, and the employer or self-employment context before choosing an occupation label. If the worker later changes occupation, bank account, or mobile number, preserve both the earlier card details and the update acknowledgement instead of presenting the new record as the original registration.",
  "government-scheme-2026-pm-shram-yogi-maandhan-readiness-guide":
    "Before pension enrolment, test whether the worker's age, occupation, income position, and existing pension coverage fit the current programme conditions. Then review the contribution amount and debit mandate with the worker in plain language. A pension-readiness file should make later debit failures, nominee changes, or account corrections traceable without confusing them with the worker's eShram registration.",
  "government-scheme-2026-pm-vishwakarma-registration-document-checklist":
    "The central factual question is whether the applicant actually practises the trade entered in the registration. Keep local-verification or trade evidence that explains that activity, but do not invent business history merely to fit a category. Training, toolkit support, credit, and marketing assistance are later programme stages; record them separately from the initial artisan-registration evidence.",
  "government-scheme-2026-farmer-scheme-search-before-applying":
    "Build a short comparison table before selecting a programme. For each option, record the need addressed, administering department, applicant or land condition, required record, application window, and likely follow-up authority. This prevents a farmer from treating an income-support programme, crop-insurance claim, equipment subsidy, and credit request as interchangeable simply because each asks for Aadhaar and bank details.",
  "government-scheme-2026-pm-kusum-solar-pump-checklist":
    "A solar-pump proposal needs a site and technical trail, not only farmer identity records. Confirm the state nodal agency, applicable component, land or installation site, existing electricity or pump position, approved-vendor route, applicant contribution, and payment instruction. Do not pay a vendor or intermediary until the official channel and stage of payment have been verified.",
  "government-scheme-2026-pm-ujjwala-lpg-connection-checklist":
    "Review the household record before approaching the LPG distributor. Identify the applicant, existing household connection position, accepted ration or family evidence, bank holder, and address used by the distributor. Keep the distributor's application or connection reference because it is the practical record for correcting a connection-stage issue; a general housing-benefit reference cannot answer that query.",
  "government-scheme-2026-pmay-gramin-beneficiary-document-checklist":
    "The PMAY-Gramin file should explain why the household appears in the beneficiary and local-verification process, the current housing condition, and the bank account used for assistance. Preserve inspection stages, local-body communication, and any beneficiary-status correction. These records answer different questions from LPG-connection or general ration-card documents, even when the household name and Aadhaar appear in all of them.",
  "government-scheme-2026-pmjjby-insurance-renewal-nominee-checklist":
    "For PMJJBY, separate evidence of life-insurance enrolment from evidence needed after the insured person's death. Review the annual premium debit, enrolment period, nominee entry, and bank communication while the account holder can still correct them. A later claim file will need the applicable death and claimant records; an old debit entry alone cannot establish a complete claim. Read the current renewal and exit instructions before the annual debit window, especially where the account has changed or lacked funds. Record the bank branch or channel used for any nominee correction, and keep the acknowledgement with the enrolment record so a claimant is not left to reconstruct the account holder's instructions from memory.",
  "government-scheme-2026-pmsby-accident-insurance-checklist":
    "For PMSBY, record the coverage period and the accident-related evidence that would be required if an insured event occurs. The file should distinguish enrolment and premium debit from accident intimation, medical or disability evidence, and claimant or nominee documents. Do not assume that the life-insurance claim path or records used for PMJJBY answer the accident-specific questions. If an accident occurs, create a dated chronology of intimation, treatment, certification, police or authority records where applicable, and communication with the bank or insurer. That chronology should identify the claimed event and resulting loss without treating a premium debit as proof of the accident, disability, or claim amount.",
  "government-scheme-2026-udyam-registration-msme-checklist":
    "Before changing an Udyam entry, identify which source registration owns the disputed fact. A PAN, GSTIN, activity classification, or turnover difference should be corrected or explained at its source before the enterprise copies that value into another record. Preserve the earlier certificate and the update acknowledgement so customers, lenders, and departments can follow the change.",
  "government-scheme-2026-central-sector-scholarship-college-checklist":
    "Record the academic year and institution-verification stage beside every correction. A marks or course change made after submission should be traceable to the institution response, while a bank change should be traceable to the account record used for payment.",
  "government-scheme-2026-digilocker-document-readiness-guide":
    "Before sharing a DigiLocker item, distinguish an issuer-fetched record from a user-uploaded copy. Note the issuer, document status, and receiving authority's acceptance rule; the presence of a file in the account does not by itself establish how another department will treat it.",
  "government-scheme-2026-disability-certificate-tax-scheme-checklist":
    "Limit each disclosure to the benefit or tax question being answered. The certificate may establish a certified status, while clinical notes, expenditure records, and deduction evidence serve separate purposes and should not be shared merely because they concern the same person.",
  "government-scheme-2026-kisan-credit-card-application-checklist":
    "Translate the requested credit into an activity and repayment explanation. Show the crop, cycle, input, or allied activity behind the amount, then identify which land, quotation, borrowing, and bank records support that explanation without treating any single record as the full proposal.",
  "government-scheme-2026-pm-kisan-eligibility-tax-record-checklist":
    "Treat land, beneficiary, bank, and tax-status checks as separate decisions. When a status query appears, record the exact field and programme response instead of changing unrelated documents or assuming that a successful earlier instalment resolves the current issue.",
  "government-scheme-2026-pm-matsya-sampada-fisheries-checklist":
    "Define the fisheries component before assembling finance records. A pond, hatchery, cage, vessel, feed unit, cold chain, and processing facility can require different site evidence, capacity assumptions, permissions, quotations, and milestones. The proposal should state the unit of activity, location or water-use basis, proposed capacity, applicant contribution, and implementation sequence. Keep later inspections and purchases against those stated milestones so a release query can be answered from physical progress rather than a generic project summary.",
  "government-scheme-2026-pmkvy-skill-training-registration-checklist":
    "Verify the course and training centre before treating registration as an employment outcome. Keep attendance, assessment, certification, and placement communication by stage so the learner can show what was completed and can challenge a missing or incorrect result.",
  "government-scheme-2026-stand-up-india-loan-readiness-checklist":
    "Resolve programme fit before asking the lender to appraise the project. Record the eligible promoter, ownership and control position, greenfield status, enterprise activity, total project cost, promoter contribution, term-loan need, working-capital need, and proposed repayment source. Then keep the lender's appraisal, security questions, sanction conditions, and disbursement stages in a separate credit trail. This prevents category evidence from being treated as a substitute for project viability or a bank decision.",
};

const routeDifferentiators: Record<string, string> = {
  "government-scheme-2026-eshram-card-registration-checklist":
    "Treat eShram as a worker-registration record, not as proof of pension enrolment, employment, income, or a later benefit. The occupation entry should describe the work actually performed when the profile is created. Keep the original card details, each update acknowledgement, and the date a bank account, mobile number, address, or occupation changed. A later PM-SYM or other programme application should carry its own eligibility, mandate, contribution, nominee, and status trail instead of being folded into the eShram file.",
  "government-scheme-2026-farmer-scheme-search-before-applying":
    "The output of a scheme search should be a comparison, not an application bundle. For each possible programme, record the problem addressed, administering body, applicant or activity condition, state or local route, application window, record that establishes the relevant fact, and follow-up channel. Remove options that do not match the farmer's need before collecting documents. Income support, credit, insurance, energy, equipment, and project assistance may all ask for Aadhaar and bank details while testing entirely different land, crop, loss, asset, or finance questions.",
  "government-scheme-2026-kisan-credit-card-application-checklist":
    "Build the Kisan Credit Card request as a lender file. State the agricultural or allied activity, crop or operating cycle, amount needed, proposed use, existing borrowing, repayment source, and account through which the facility would operate. Land and crop records help explain the activity; they do not replace the lender's credit assessment. Keep quotations, cost assumptions, lender questions, sanction or rejection, conditions, and disbursement stages separate from a crop-insurance claim or general scheme-search record.",
  "government-scheme-2026-pm-fasal-bima-claim-document-checklist":
    "Build a crop-insurance claim around the insured event and its dates. Connect the relevant season, crop, plot or activity, policy or enrolment acknowledgement, premium or coverage record, loss intimation, survey or assessment communication, bank account, and claim response. Record when and how the loss was reported and preserve every later request. A land record or general crop detail can support identity or activity, but it does not establish the insured event, timely intimation, assessed loss, or claim outcome.",
  "government-scheme-2026-pm-kusum-solar-pump-checklist":
    "Build the solar-pump file around the applicable component, state nodal route, site, existing energy and irrigation position, proposed equipment, approved-vendor process, applicant contribution, and installation sequence. A farmer identity or land record can help establish the applicant and site, but it does not establish technical suitability, vendor approval, payment stage, installation, or commissioning. Before paying, match the demand or instruction to the official channel and the stated project stage. Keep site inspection, vendor quotation, payment acknowledgement, equipment details, installation evidence, grid or utility communication where relevant, and later service issues as dated events. This separates a specific energy project from a general search for farm-support programmes.",
  "government-scheme-2026-pmfme-food-processing-micro-unit-checklist":
    "Describe the actual food-processing unit before preparing a PMFME finance file. Record the product, raw material, process, existing or proposed capacity, premises, equipment, project cost, applicant contribution, finance need, market route, and approvals relevant to the unit. Match quotations and the project estimate to that operating description. Keep food-business licences, local approvals, lender appraisal, training or group records, inspections, purchases, and implementation milestones separate so a finance or support query can be answered from the specific unit rather than a generic business plan.",
  "government-scheme-2026-startup-india-seed-fund-readiness-guide":
    "Prepare the seed-fund proposal for an incubator assessment rather than as a generic loan file. Connect the recognised startup, problem, solution, evidence of progress, team, requested support, use of funds, milestones, and financial records to the same proposal version. Keep the presentation, application, committee or incubator questions, decision, conditions, and later milestone evidence by date. A recognition certificate establishes the entity's status; it does not prove that the product, milestones, funding need, or assessed proposal will be accepted.",
  "government-scheme-2026-aicte-pragati-saksham-scholarship-guide":
    "Keep the scholarship notice and applicant category beside the student file. Do not merge two scholarship paths simply because they share an application channel or ask for similar academic records. The working should identify the course, institution, admission stage, category-specific evidence, family-income period, and bank holder used for this application. If the institution changes a course or verification detail, preserve the earlier submission and the institution response so the correction can be traced to the right academic cycle.",
  "government-scheme-2026-apprenticeship-india-registration-checklist":
    "Separate portal registration from an actual apprenticeship engagement. The learner file should identify the establishment, trade or role, contract or offer, training period, stipend instruction, attendance, assessment, and completion or exit record. Verify who controls a missing contract, stipend, attendance entry, or certificate before raising the issue. A profile or qualification upload can support matching, but it does not prove that an establishment engaged the learner or completed the training obligation.",
  "government-scheme-2026-central-sector-scholarship-college-checklist":
    "Build a year-specific college scholarship file. Connect the qualifying academic result, current course and institution, family-income record, student bank account, and institution-verification status to the same academic year. Keep renewal or continuation questions separate from the first application. A bank correction should not overwrite the marks or admission evidence, and an institution response should identify which submitted field it confirms or changes.",
  "government-scheme-2026-caste-certificate-scholarship-loan-checklist":
    "Treat the caste or community certificate as one authority-issued record, not as proof that a scholarship or loan has been approved. Identify the issuing state or authority, certificate holder, category, certificate number, relevant validity or verification status, and the exact receiving programme that asks for it. Keep family, residence, income, academic, and lender records separate because each receiving authority tests a different condition. Route a certificate error to the issuing authority and a scholarship or loan-status issue to the programme or lender handling that application.",
  "government-scheme-2026-atal-pension-yojana-bank-mandate-checklist":
    "Treat the pension choice and the bank mandate as separate records. The subscriber file should show the selected pension option, age and identity details used at enrolment, contribution instruction, debit history, nominee information, and every acknowledged correction. Investigate failed or unexpected debits through the bank or official channel. Compare the contribution instruction with the actual debit pattern and keep a dated explanation for a missed, delayed, or changed contribution. Do not use a successful debit alone as proof that nominee, pension option, or later account details are correct.",
  "government-scheme-2026-jan-dhan-account-benefits-document-checklist":
    "Review the account as a banking and benefit-receipt record, not as a promised package of benefits. Confirm the account holder, KYC status, mobile and nominee details, operating bank or branch, and any benefit or direct-transfer entry being investigated. Separate an account-opening issue from a failed credit, card issue, or later KYC restriction. Preserve the bank's response to each correction so the holder can show what changed and when.",
  "government-scheme-2026-pm-svanidhi-street-vendor-loan-checklist":
    "Separate vendor recognition from the lender's credit and repayment records. The local-body or recommendation trail should identify the vending activity and applicant, while the lender file should show application, sanction or rejection, disbursement, repayment, and any later support entry. A bank credit cannot repair a missing vendor record, and a vendor certificate does not prove repayment. Keep disputes with the correct authority instead of combining them into one general follow-up.",
  "government-scheme-2026-pm-vishwakarma-registration-document-checklist":
    "Keep artisan registration, local verification, training, toolkit support, credit, and marketing assistance as distinct stages. The initial file should explain the trade actually practised and the evidence used for that classification. Later programme records should identify the stage, authority or provider, date, and outcome. Do not create business history or invoices merely to fit a trade label, and do not treat completion of one stage as proof that another benefit has been approved.",
  "government-scheme-2026-pm-ujjwala-lpg-connection-checklist":
    "Distinguish household eligibility from distributor fulfilment. The application file should identify the applicant, household record, address, bank holder, and application reference; the distributor trail should show connection-stage communication, delivery or installation, and any correction. A later refill or service issue belongs in a separate follow-up unless it reveals an error in the original connection record. Verify payment or document requests through the official programme or distributor channel.",
  "government-scheme-2026-pmay-gramin-beneficiary-document-checklist":
    "Create a housing-assistance chronology from beneficiary identification through local verification, inspection, bank details, construction stage, and programme communication. Each inspection or instalment question should point to the relevant date, property or household record, and authority response. Do not use an LPG, ration-card, or general bank record as a substitute for the housing fact being checked. Preserve beneficiary-status corrections and stage evidence without overwriting the earlier record.",
  "government-scheme-2026-pmjjby-insurance-renewal-nominee-checklist":
    "Keep life-cover enrolment and a later death-claim file separate. While the account holder can act, verify the enrolment period, premium debit, nominee entry, bank channel, and acknowledged changes. If a claim event occurs, build a dated file from the coverage record, death and claimant documents, submission, and insurer or bank follow-up. A debit can support payment history, but it does not establish every coverage or claim fact.",
  "government-scheme-2026-pmsby-accident-insurance-checklist":
    "Connect accident-cover enrolment to the applicable coverage period, then keep any accident or disability claim in its own dated chronology. The claim file should identify the event, intimation, medical or disability evidence, authority record where applicable, claimant or nominee details, and bank or insurer response. A premium debit does not prove the accident, resulting loss, or claim amount, and life-insurance documents do not replace accident-specific evidence.",
  "government-scheme-2026-pm-matsya-sampada-fisheries-checklist":
    "Build the fisheries proposal around the actual activity and asset: hatchery, pond, cage, vessel, cold-chain unit, processing facility, or another eligible component. Record the site or water-use basis, technical capacity, quotations, permissions, applicant contribution, finance request, and expected operating evidence for that component. Keep inspection, milestone, purchase, and installation records by date so a later release or status query can be answered against the work completed. A general business plan or bank statement does not establish the fisheries asset, technical permission, or implementation stage.",
  "government-scheme-2026-stand-up-india-loan-readiness-checklist":
    "Test the proposed enterprise against the current greenfield and promoter conditions before preparing the lender file. Document the eligible promoter's ownership and control, category or woman-promoter evidence where required, proposed activity, project cost, promoter contribution, term-loan and working-capital need, and repayment assumptions. Separate the programme eligibility question from the bank's credit appraisal, security, sanction, and disbursement decisions. An existing enterprise, unsupported ownership claim, or generic project report can change the route even when the applicant's KYC is complete.",
  "government-scheme-2026-sukanya-samriddhi-account-checklist":
    "Build the Sukanya Samriddhi account record around the girl child, guardian, opening date, age evidence used at opening, account office, and deposit history. Reconcile each financial year's deposits and receipts before using an amount in a tax working, and keep guardian or account-detail corrections with the original opening record. Withdrawal, maturity, transfer, and closure questions belong to the account operator's current rules and dated response. A deposit receipt supports a transaction; it does not by itself establish every account condition or later withdrawal entitlement.",
  "government-scheme-2026-pmegp-loan-subsidy-application-checklist":
    "Treat PMEGP preparation as a greenfield-enterprise and bank-appraisal exercise. First establish the proposed promoter, activity, location, project cost, applicant contribution, finance request, and operating assumptions. Then separate programme eligibility from the bank's assessment of viability, repayment, security, and documentation. The project report should explain what will be sold, who may buy it, how the cost was estimated, and how the enterprise expects to operate after disbursement. State the proposed employment, implementation schedule, and evidence that will show the unit was established and began operating. Keep application, appraisal questions, sanction or rejection, margin-money or programme communication, purchases, and implementation evidence by stage. Do not describe programme-linked support as cash already available, and do not treat category or identity evidence as proof that the project is commercially viable.",
  "government-scheme-2026-nsap-pension-senior-citizen-checklist":
    "Build the NSAP pension file around the beneficiary and the local verification route used for that person. Record the applicable pension category, age or status evidence, household and local-body entry, bank or post-office account, application reference, verification response, and each payment-period issue separately. A bank statement can show whether a credit arrived, but it cannot establish why a beneficiary was included, excluded, paused, or removed. For a missing credit, identify the last successful period and ask whether the problem belongs to beneficiary status, local verification, payment processing, or the account. Keep any life-certificate, beneficiary-verification, or local enquiry response with the period it affects instead of treating it as a permanent answer. Preserve changes caused by death, migration, account closure, or corrected household details so later family and authority queries can follow the actual chronology.",
  "government-scheme-2026-national-scholarship-portal-student-checklist":
    "Treat an NSP application as an academic-cycle file with several decision owners. The student supplies application facts and records; the institution verifies course and enrolment details; a scheme or nodal authority applies the relevant conditions; and the payment system uses the accepted bank information. Record the academic year, scheme selected, application identifier, institution-verification stage, correction window, and final status together. A marksheet, income record, category record, and bank entry answer different questions and may be controlled by different issuers. If a course, institution, identity, or bank detail changes, preserve the original submission and the response from the owner of that field. Do not assume that portal submission, institution verification, selection, and payment are the same event.",
  "government-scheme-2026-umang-app-services-checklist":
    "Use UMANG as a service channel, not as the authority that owns every transaction offered inside it. Begin by identifying the department and specific service selected, then record the account or identity used, action requested, department reference, payment or submission status, and acknowledgement returned by that service. A login success or app screen does not prove that the department accepted, processed, or corrected the underlying request. Keep security-sensitive login information out of the working file, while preserving the transaction identifier and department response needed for follow-up. If a status appears inconsistent, verify it through the service-owning department and record whether the app view is delayed, the request failed, or the department needs a correction.",
  "government-scheme-2026-pmay-urban-home-loan-record-guide":
    "Prepare the PMAY Urban file around the household, property, applicable programme route, and finance trail. Identify the applicant and household position, property or proposed purchase, ownership and occupancy facts, lender involvement, application or assessment reference, and any inspection or stage communication. Separate a housing-programme condition from the lender's credit decision and from the property's legal and physical records. A loan account or bank statement can show finance movement, but it cannot establish household eligibility, property status, completion, or inspection findings. Keep the submitted household and property version with later lender, local-body, programme, and inspection responses so a subsidy or status query can be traced to the exact route and property reviewed.",
  "government-scheme-2026-nps-account-opening-checklist":
    "Build the NPS record around the subscriber and contribution channel rather than treating every deposit as the same transaction. Identify the PRAN, KYC and contact details, account-opening route, personal contribution, employer contribution where relevant, nominee entry, investment instruction, and acknowledgement for each change. Reconcile contributions by date and source before using them in a tax working; a payroll entry, bank debit, and account statement may describe separate stages of one contribution. Keep an unsuccessful or reversed payment visible and follow it through the applicable channel. Nominee, contact, scheme-preference, withdrawal, and exit questions should each carry their own request and response instead of being folded into a general account-opening note.",
};

const reviewLenses = [
  "field-level identity audit",
  "consent-aware record linkage",
  "academic-cycle verification",
  "qualification-to-placement trace",
  "recurring-debit continuity",
  "household-beneficiary matching",
  "certificate-authority validation",
  "institution-to-payment trail",
  "lender-led credit assessment",
  "issuer-origin verification",
  "certificate-to-claim boundary",
  "occupation-history trace",
  "need-to-programme comparison",
  "enterprise-catalogue consistency",
  "income-period alignment",
  "account-benefit continuity",
  "agricultural credit-purpose audit",
  "invoice-to-due-date chronology",
  "use-of-funds assessment",
  "claim-to-qualification trace",
  "academic-year submission trail",
  "subscriber contribution trail",
  "local-verification chronology",
  "beneficiary-to-inspection trail",
  "borrower-property-subsidy alignment",
  "project-cost funding bridge",
  "insured-season claim chronology",
  "unit-project-approval alignment",
  "renewal-to-claim separation",
  "land-beneficiary-bank alignment",
  "site-vendor-payment sequence",
  "centre-registration-outcome trail",
  "project-asset-permission alignment",
  "accident-event claim chronology",
  "worker-contribution continuity",
  "consumer-vendor-installation trail",
  "vendor-loan-repayment trail",
  "household-distributor-connection trace",
  "artisan-activity verification",
  "ledger-to-return bridge",
  "household-portability correction trail",
  "interest-withholding audit",
  "field-sample-advisory linkage",
  "promoter-project-finance alignment",
  "entity-innovation recognition test",
  "incubator-assessed proposal trail",
  "custodial savings audit",
  "source-registration consistency",
  "department-action acknowledgement trail",
  "programme-fit comparison",
] as const;

function reviewLensFor(slug: string) {
  const index = Object.keys(routeNotes).indexOf(slug);
  const lens = reviewLenses[index];
  if (!lens) throw new Error(`Missing review lens for ${slug}`);
  return lens;
}

function sentenceCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function recordVerb(record: string, singular: string, plural: string) {
  return /\band\b|(?:s|records|details|returns|receipts|statements|invoices|proofs)$/i.test(record.trim())
    ? plural
    : singular;
}

function cleanSchemeName(meta: Frontmatter) {
  if (meta.slug === "government-scheme-2026-ration-card-one-nation-one-ration-card-checklist") {
    return "One Nation One Ration Card (ONORC)";
  }
  if (meta.slug === "government-scheme-2026-disability-certificate-tax-scheme-checklist") {
    return "Disability benefit and tax claim";
  }
  const official = (meta.sourceLinks ?? []).find((source) => /official|portal|department|ministry/i.test(source.label ?? ""));
  const fromSource = official?.label
    ?.replace(/\s*-\s*official.*$/i, "")
    .replace(/\s+official\s+(?:portal|website|page).*$/i, "")
    .replace(/\s+(?:portal|website)$/i, "")
    .trim();
  if (fromSource && !/^myscheme$/i.test(fromSource)) return fromSource;
  return (meta.title ?? "Government scheme")
    .replace(/\s+(?:Eligibility|Application|Registration|Documents?|Checklist|Readiness|Record|Tax|Scheme|Guide|Benefits?).*$/i, "")
    .trim();
}

function audienceFor(meta: Frontmatter) {
  const candidate = [...(meta.secondaryKeywords ?? [])]
    .reverse()
    .find((item) => !/government scheme|documents?|eligibility|checklist|application/i.test(item));
  return candidate ?? "applicants";
}

function documentsFor(meta: Frontmatter) {
  return (meta.keyTopics ?? [])
    .slice(1)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function bodyDocumentsFor(meta: Frontmatter) {
  const replacements: Record<string, string> = {
    "government-scheme-2026-caste-certificate-scholarship-loan-checklist": "category certificate",
    "government-scheme-2026-disability-certificate-tax-scheme-checklist": "certified disability record",
    "government-scheme-2026-ration-card-one-nation-one-ration-card-checklist": "household food-security record",
  };
  const replacement = replacements[meta.slug ?? ""];
  return documentsFor(meta).map((document, index) => index === 0 && replacement ? replacement : document);
}

function focusFor(meta: Frontmatter) {
  const focus = meta.keyTopics?.[0]?.replace(/[.]+$/, "");
  if (!focus) return `comparison of the application records for ${meta.primaryKeyword ?? "the scheme"}`;

  return focus
    .replace(
      /^(?:use|safe use of) digital health records carefully while preserving\s+/i,
      "safe use of digital health records while preserving ",
    )
    .replace(
      /^(?:use|safe use of) issued digital documents while preserving\s+/i,
      "use of issued digital documents while preserving ",
    )
    .replace(/^(?:use|safe use of) official portals to compare\s+/i, "official-portal comparison of ")
    .replace(/^build an accurate\s+/i, "accurate ")
    .replace(/^check\s+/i, "verification of ")
    .replace(/^keep\s+/i, "recordkeeping for ")
    .replace(/^match\s+/i, "alignment of ")
    .replace(/^organise\s+/i, "organisation of ")
    .replace(/^prepare\s+/i, "preparation of ")
    .replace(/^preserve\s+/i, "retention of ")
    .replace(/^understand\s+/i, "review of ")
    .replace(/^use\s+/i, "safe use of ")
    .replace(/^verify\s+/i, "verification of ")
    .replace(/\bof of\b/gi, "of")
    .replace(/\s+before\b.*$/i, "");
}

function roleFor(document: string) {
  if (/\b(aadhaar|pan|kyc|identity|id|caste certificate|disability certificate)\b/i.test(document)) {
    return "the applicant's identity, legal name, identifier, or certified status";
  }
  if (/\b(bank|passbook|cancelled cheque|mandate|account)\b/i.test(document)) {
    return "the account holder and the account used for a payment, contribution, refund, or benefit";
  }
  if (/\b(land|crop|farm|soil|pump)\b/i.test(document)) {
    return "the land, crop, agricultural activity, or asset described in the request";
  }
  if (/\b(income|tax return|itr|salary|pension|interest certificate)\b/i.test(document)) {
    return "the income, tax, interest, or pension fact for the relevant period";
  }
  if (/\b(invoice|quotation|quote|purchase order|sanction|loan|financial statement|project report|cost)\b/i.test(document)) {
    return "the transaction, cost, finance request, vendor, or business figures";
  }
  if (/\b(udyam|gst|business|occupation|vendor|activity|registration|trade)\b/i.test(document)) {
    return "the enterprise, occupation, registration, or business activity";
  }
  if (/\b(property|electricity|consumer|address|residence|ration card|house)\b/i.test(document)) {
    return "the premises, household, address, property, or consumer connection";
  }
  if (/\b(student|education|institution|marksheet|certificate|course|resume|qualification)\b/i.test(document)) {
    return "the education, qualification, institution, training, or applicant status";
  }
  if (/\b(family|nominee|guardian|birth|marriage)\b/i.test(document)) {
    return "the family, guardian, nominee, or relationship detail";
  }
  if (/\b(mobile|email|contact)\b/i.test(document)) {
    return "the contact channel used for verification, alerts, and follow-up";
  }
  if (/\b(application|acknowledgement|receipt|reference|claim|complaint)\b/i.test(document)) {
    return "the submitted answers, reference number, date, and current application status";
  }
  return `the specific applicant or application fact stated on ${document}`;
}

function bodyRoleFor(document: string) {
  if (/\b(aadhaar|pan|kyc|identity|id|caste certificate|disability certificate)\b/i.test(document)) {
    return "Name, identifier, or certified status";
  }
  if (/\b(bank|passbook|cancelled cheque|mandate|account)\b/i.test(document)) {
    return "Holder, account, or payment instruction";
  }
  if (/\b(land|crop|farm|soil|pump)\b/i.test(document)) {
    return "Holding, crop, activity, or asset";
  }
  if (/\b(income|tax return|itr|salary|pension|interest certificate)\b/i.test(document)) {
    return "Income or tax fact for the period";
  }
  if (/\b(invoice|quotation|quote|purchase order|sanction|loan|financial statement|project report|cost)\b/i.test(document)) {
    return "Amount, party, purpose, or finance request";
  }
  if (/\b(udyam|gst|business|occupation|vendor|activity|registration|trade)\b/i.test(document)) {
    return "Enterprise, occupation, or activity";
  }
  if (/\b(property|electricity|consumer|address|residence|ration card|house)\b/i.test(document)) {
    return "Premises, household, or consumer connection";
  }
  if (/\b(student|education|institution|marksheet|certificate|course|resume|qualification)\b/i.test(document)) {
    return "Course, qualification, or institution status";
  }
  if (/\b(family|nominee|guardian|birth|marriage)\b/i.test(document)) {
    return "Family, guardian, or nominee relationship";
  }
  if (/\b(mobile|email|contact)\b/i.test(document)) {
    return "Reachable verification and follow-up channel";
  }
  if (/\b(application|acknowledgement|receipt|reference|claim|complaint)\b/i.test(document)) {
    return "Submitted answer, reference, date, or status";
  }
  return "Fact stated on this record";
}

function recordReferenceFor(document: string) {
  if (/\b(aadhaar|pan|kyc|identity|id|caste certificate|disability certificate)\b/i.test(document)) {
    return "the identity record";
  }
  if (/\b(bank|passbook|cancelled cheque|mandate|account)\b/i.test(document)) {
    return "the account record";
  }
  if (/\b(land|crop|farm|soil|pump)\b/i.test(document)) {
    return "the farm record";
  }
  if (/\b(income|tax return|itr|salary|pension|interest certificate)\b/i.test(document)) {
    return "the income record";
  }
  if (/\b(invoice|quotation|quote|purchase order|sanction|loan|financial statement|project report|cost)\b/i.test(document)) {
    return "the finance record";
  }
  if (/\b(udyam|gst|business|occupation|vendor|activity|registration|trade)\b/i.test(document)) {
    return "the business record";
  }
  if (/\b(property|electricity|consumer|address|residence|ration card|house)\b/i.test(document)) {
    return "the property record";
  }
  if (/\b(student|education|institution|marksheet|certificate|course|resume|qualification)\b/i.test(document)) {
    return "the education record";
  }
  if (/\b(family|nominee|guardian|birth|marriage)\b/i.test(document)) {
    return "the family record";
  }
  if (/\b(mobile|email|contact)\b/i.test(document)) {
    return "the contact record";
  }
  if (/\b(application|acknowledgement|receipt|reference|claim|complaint)\b/i.test(document)) {
    return "the application reference";
  }
  return "the supporting record";
}

function replaceAfterFirstOutsideLinks(value: string, label: string, replacements: string[]) {
  if (!label || replacements.some((replacement) => label.toLowerCase() === replacement.toLowerCase())) return value;

  let introduced = false;
  let replacementIndex = 0;
  const pattern = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return value
    .split(/(\[[^\]]+\]\([^)]+\))/g)
    .map((part) => {
      if (/^\[[^\]]+\]\([^)]+\)$/.test(part)) return part;
      return part.replace(pattern, (match) => {
        if (!introduced) {
          introduced = true;
          return match;
        }
        const replacement = replacements[replacementIndex % replacements.length];
        replacementIndex += 1;
        return replacement;
      });
    })
    .join("");
}

function naturalizeIntroducedLabels(
  body: string,
  labels: {
    scheme: string;
    focus: string;
    documents: string[];
  },
) {
  const isLongLabel = (label: string) => label.trim().split(/\s+/).length >= 4;
  let naturalized = isLongLabel(labels.focus)
    ? replaceAfterFirstOutsideLinks(body, labels.focus, ["the application question", "that question"])
    : body;
  for (const document of [...labels.documents].sort((left, right) => right.length - left.length)) {
    if (!isLongLabel(document)) continue;
    naturalized = replaceAfterFirstOutsideLinks(
      naturalized,
      document,
      /\backnowledgement\b/i.test(document)
        ? ["the acknowledgement"]
        : [recordReferenceFor(document), "that document"],
    );
  }
  if (isLongLabel(labels.scheme)) {
    naturalized = replaceAfterFirstOutsideLinks(naturalized, labels.scheme, ["the programme", "the application"]);
  }

  return naturalized
    .replace(/\bthe\s+the\b/gi, "the")
    .replace(/\bthe\s+that\b/gi, "that")
    .replace(/\ba\s+the\b/gi, "the")
    .replace(/\ba\s+that\b/gi, "that")
    .replace(/\bthis\s+the\b/gi, "this")
    .replace(/\bcurrent\s+the\b/gi, "current")
    .replace(/\bcurrent\s+that\b/gi, "current")
    .replace(/\brelevant\s+the\b/gi, "relevant")
    .replace(/\brelevant\s+that\b/gi, "relevant")
    .replace(/\bsubmitted\s+the\b/gi, "submitted")
    .replace(/\bsubmitted\s+that\b/gi, "submitted")
    .replace(/\bgenuine\s+the\b/gi, "genuine")
    .replace(/\bgenuine\s+that\b/gi, "genuine")
    .replace(/\bwhich\s+the\b/gi, "which")
    .replace(/\bwhich\s+that\b/gi, "which")
    .replace(/\bthese\s+the\b/gi, "these")
    .replace(/\bthe original\s+the\b/gi, "the original")
    .replace(/\b(record|document|source)\s+record\b/gi, "$1")
    .replace(/\bthe requested answer answer\b/gi, "the requested answer")
    .replace(/\bthe application question answer\b/gi, "the application question")
    .replace(/\bthat question answer\b/gi, "that question")
    .replace(/\bcurrent application question requirements\b/gi, "current requirements for the application question")
    .replace(/\bapplication question instruction\b/gi, "instruction for the application question")
    .replace(/\bapplication question working\b/gi, "application working")
    .replace(/\bsame the application question fact\b/gi, "same application fact")
    .replace(/\bsame that question fact\b/gi, "same application fact")
    .replace(/\boriginal that question\b/gi, "original answer")
    .replace(/\boriginal the application question\b/gi, "original answer")
    .replace(/\btraceable that question file\b/gi, "traceable application file")
    .replace(/\btraceable the application question file\b/gi, "traceable application file")
    .replace(/\bidentify that question taken\b/gi, "identify the answer taken")
    .replace(/\bidentify the application question taken\b/gi, "identify the answer taken")
    .replace(/\brecord later the application question messages\b/gi, "record later messages about the application question")
    .replace(/\brecord later that question messages\b/gi, "record later messages about that question")
    .replace(/\bthat question review\b/gi, "review of that question")
    .replace(/\bthe application question review\b/gi, "review of the application question")
    .replace(/\bthe programme programme\b/gi, "the programme")
    .replace(/\bthe application application\b/gi, "the application")
    .replace(/^##\s+the (programme|application|scheme):/gim, "## Programme:")
    .replace(/^\|\s+the (programme|application|scheme) record\s+\|/gim, "| Application record |")
    .replace(/^-\s+which\b/gim, "- Which")
    .replace(/(^|[.!?]\s+|\n\n)the (programme|application|scheme)\b/g, (_, prefix, label) =>
      `${prefix}The ${label}`);
}

function comparisonFor(document: string, nextDocument: string) {
  if (/\b(bank|passbook|account|mandate)\b/i.test(document)) {
    return `Check the account holder name and account details on ${document}; compare any linked identity or applicant name with ${nextDocument}.`;
  }
  if (/\b(aadhaar|pan|kyc|identity|id)\b/i.test(document)) {
    return `Use ${document} for identity details, then compare the name and identifier with ${nextDocument} before uploading either record.`;
  }
  if (/\b(invoice|quotation|quote|purchase order|sanction|loan|financial statement|project report|cost)\b/i.test(document)) {
    return `Trace the amount, party, date, and purpose shown by ${document}; explain any difference found in ${nextDocument}.`;
  }
  if (/\b(land|crop|farm|soil|pump|property|electricity|consumer|address|residence|house)\b/i.test(document)) {
    return `Confirm the location, ownership, use, or asset detail on ${document}; do not substitute ${nextDocument} for a fact it does not contain.`;
  }
  return `Read the issuer, date, name, identifier, and status on ${document}; compare the relevant answer with ${nextDocument}.`;
}

function bodyComparisonFor(document: string, nextDocument: string, focus: string) {
  if (/\b(bank|passbook|account|mandate)\b/i.test(document)) {
    return `For ${focus}, match the holder and account to ${nextDocument}; note the result before submission.`;
  }
  if (/\b(aadhaar|pan|kyc|identity|id)\b/i.test(document)) {
    return `For ${focus}, compare the name and identifier with ${nextDocument}; identify the issuer for any correction.`;
  }
  if (/\b(invoice|quotation|quote|purchase order|sanction|loan|financial statement|project report|cost)\b/i.test(document)) {
    return `For ${focus}, reconcile amount, party, date, and purpose with ${nextDocument}; explain any material variance.`;
  }
  if (/\b(land|crop|farm|soil|pump|property|electricity|consumer|address|residence|house)\b/i.test(document)) {
    return `For ${focus}, test location, ownership, use, or asset detail against ${nextDocument}; keep the comparison with the submitted record.`;
  }
  return `For ${focus}, compare issuer, date, identifier, and status with ${nextDocument}; record the outcome.`;
}

function questionsFor(slug: string, scheme: string, focus: string, documents: string[]) {
  const [first, second, third, fourth] = [
    documents[0],
    documents[1],
    documents[2],
    documents[3] ?? `${scheme} acknowledgement`,
  ];
  return [
    `Write down the exact ${focus} answer taken from ${first}, including the field or entry used.`,
    `Read ${second} separately and note whether it confirms the same fact or answers another part of the request.`,
    `Use ${third} only for ${roleFor(third)}; identify its issuer if a correction is required.`,
    `Connect the reply from ${escalationTargetFor(slug)} to ${fourth} so the submitted version remains identifiable.`,
  ];
}

function sourceMarkdown(source: SourceLink) {
  return source.url ? `[${source.label ?? source.url}](${source.url})` : source.label ?? "Official source";
}

function hashFor(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function chooseFor<T>(slug: string, values: T[]) {
  return values[hashFor(`${slug}:${values.length}`) % values.length];
}

function chooseRouteVariant<T>(slug: string, salt: string, values: T[]) {
  const routeIndex = Object.keys(routeNotes).indexOf(slug);
  if (routeIndex < 0 || values.length < 2) return chooseFor(`${slug}:${salt}`, values);

  const saltHash = hashFor(salt);
  const strides = [1, 3, 7, 9];
  const stride = strides[saltHash % strides.length];
  const cycleOffset = Math.floor(routeIndex / values.length) * (1 + (saltHash % (values.length - 1)));
  return values[(routeIndex * stride + cycleOffset + saltHash) % values.length];
}

function contextualizeParagraph(
  value: string,
  seed: string,
  context: {
    reviewLens: string;
    focus: string;
    first: string;
    second: string;
    third: string;
    fourth: string;
    audience: string;
    scheme: string;
  },
) {
  const prefixes = [
    `In the ${context.scheme} file,`,
    `Within the current ${context.scheme} task,`,
    `With ${context.first} and ${context.second} in view,`,
    `Before relying on ${context.third},`,
    `From the perspective of ${context.audience},`,
    `With ${context.fourth} retained,`,
    `During the ${context.first} check,`,
    `At the ${context.second} review stage,`,
    `After comparing ${context.second} with ${context.third},`,
    `During ${context.scheme} follow-up,`,
  ];
  const offset = hashFor(seed) % prefixes.length;
  const naturalized = value
    .replaceAll(`the ${context.reviewLens}`, "the application file")
    .replaceAll(context.reviewLens, "application file");

  return naturalized
    .split(/(?<=[.!?])\s+/)
    .map((sentence, index) => {
      const trimmed = sentence.trim();
      if (!trimmed) return "";
      const naturalLead = trimmed
        .replace(/^For every\s+/i, "With each ")
        .replace(/^For follow-up on\s+/i, "During follow-up on ")
        .replace(/^For a\s+/i, "When addressing a ")
        .replace(/^For the\s+/i, "When addressing the ")
        .replace(/^For\s+/i, "When addressing ");
      const lowercased = `${naturalLead.charAt(0).toLowerCase()}${naturalLead.slice(1)}`;
      let prefixIndex = (offset + index) % prefixes.length;
      if (prefixIndex === 4 && trimmed.toLowerCase().includes(context.audience.toLowerCase())) {
        prefixIndex = (prefixIndex + 1) % prefixes.length;
      }
      return `${prefixes[prefixIndex]} ${lowercased}`;
    })
    .filter(Boolean)
    .join(" ");
}

function categoryFor(slug: string) {
  if (/abha|ayushman|disability/.test(slug)) return "health";
  if (/aicte|scholarship|caste-certificate|income-certificate|career-service|pmkvy|apprenticeship/.test(slug)) return "education";
  if (/farmer|kisan|fasal|kusum|soil-health|matsya/.test(slug)) return "agriculture";
  if (/atal-pension|jan-dhan|nps-|nsap|pmjjby|pmsby|shram-yogi|ppf-|scss-|sukanya/.test(slug)) return "account";
  if (/pmay|surya-ghar|ujjwala|ration-card/.test(slug)) return "household";
  if (/cgtmse|mudra|pmegp|pmfme|stand-up|seed-fund|women-entrepreneur/.test(slug)) return "funding";
  if (/gem-|samadhaan|svanidhi|vishwakarma|startup-india-recognition|udyam/.test(slug)) return "business";
  return "identity";
}

function escalationTargetFor(slug: string) {
  switch (categoryFor(slug)) {
    case "health": return "the health authority or certificate issuer";
    case "education": return "the institution or scholarship authority";
    case "agriculture": return "the agriculture department, insurer, or nodal agency";
    case "account": return "the bank, post office, insurer, or pension operator";
    case "household": return "the local body, distributor, lender, or programme office";
    case "funding": return "the lender, incubator, or programme body";
    case "business": return "the department, marketplace, or complaint forum";
    default: return "the issuing department or service operator";
  }
}

function categoryGuidance(meta: Frontmatter, scheme: string, audience: string, documents: string[]) {
  const slug = meta.slug ?? scheme;
  const [first, second, third] = documents;
  const focus = focusFor(meta);
  const audienceAtSentenceStart = sentenceCase(audience);
  switch (categoryFor(slug)) {
    case "health":
      return {
        context: `${scheme} involves health or disability records, so ${audience} should separate identity data from clinical, beneficiary, or certificate evidence. The review should cover ${focus}; ${first} cannot replace the medical or household fact recorded in ${second}.`,
        mismatch: `For ${scheme}, a health-record mismatch can affect ${audience} at identification, hospital use, reimbursement, or later proof. Check the date and issuer on ${second}; compare only the identity fields established by ${first}.`,
        retain: `Keep the ${scheme} reference beside ${third} and the underlying ${second}. ${audienceAtSentenceStart} should avoid sharing unrelated medical details merely because an upload field exists.`,
        limits: `${scheme} availability and decisions based on ${second} remain with the administering body. This guide does not interpret a diagnosis, certify disability, or promise treatment or reimbursement for ${audience}.`,
      };
    case "education":
      return {
        context: `${scheme} asks ${audience} to connect an applicant's academic or training status with income, identity, institution, and payment records. For ${focus}, the institution-facing answer in ${first} should not conflict with ${second}.`,
        mismatch: `${scheme} can pause when ${audience} submit an inconsistent course, institution, family-income period, or bank holder. Use ${third} only after the applicant detail on ${first} agrees with ${second}.`,
        retain: `Preserve the ${scheme} institution verification and submitted ${first} together. A later ${second} query is easier to answer when ${third} and the acknowledgement point to the same application.`,
        limits: `${scheme} selection, ranking, institution verification, and payment remain outside this guide. ${audienceAtSentenceStart} must read the portal notice that applies to the relevant academic or training cycle.`,
      };
    case "agriculture":
      return {
        context: `${scheme} requires ${audience} to distinguish the farmer, land or activity, crop or asset, and payment account. The key issue is ${focus}; ${first}, ${second}, and ${third} should describe the same relevant holding or applicant where the portal expects them to.`,
        mismatch: `${scheme} records for ${audience} can use different plot references, seasons, owner names, or local identifiers. Compare ${first} with ${second}; do not treat ${third} as proof of a land or crop fact it cannot establish.`,
        retain: `Keep the dated ${scheme} submission with ${first}, ${second}, and the bank or activity evidence used for that request. ${audienceAtSentenceStart} should use the same season and application reference for later status checks.`,
        limits: `${scheme} field verification, local approvals, claim assessment, and benefit release remain with the programme authorities. This guide does not establish land title, crop loss, or sanction for ${audience}.`,
      };
    case "account":
      return {
        context: `${scheme} is account-linked, so ${audience} should trace identity, contribution or debit, nominee or family details, and tax or interest records separately. For ${focus}, ${first} and ${second} must relate to the same holder and period.`,
        mismatch: `${scheme} can remain active while ${audience} have an incorrect nominee, debit mandate, tax identifier, or benefit instruction. Compare ${third} with ${first} and preserve the bank or post-office response to a correction request.`,
        retain: `Keep the ${scheme} opening or enrolment record with ${second}, ${third}, and later claim or withdrawal correspondence. Each record answers a different account or tax question for ${audience}.`,
        limits: `${scheme} returns, contribution rules, cover, pension outcomes, and tax treatment depend on the product and applicant facts. ${audienceAtSentenceStart} should not read this guide as a promised return, claim payment, or benefit amount.`,
      };
    case "household":
      return {
        context: `${scheme} requires ${audience} to separate household identity from property, consumer, residence, and bank facts. The practical review is ${focus}; ${first} should establish a different part of the request from ${second}.`,
        mismatch: `${scheme} household records may give ${audience} different names, addresses, family units, consumer numbers, or ownership details. Resolve the difference between ${first} and ${second} before relying on ${third}.`,
        retain: `Save the ${scheme} reference with ${first}, ${second}, and the bank or consumer record actually uploaded. Keep later ${scheme} inspection, vendor, distributor, or local-body messages with that file.`,
        limits: `${scheme} property or household verification, vendor or distributor action, and benefit release remain with the administering bodies. This guide does not decide title, occupancy, or subsidy entitlement for ${audience}.`,
      };
    case "funding":
      return {
        context: `${scheme} funding preparation should connect the applicant, business purpose, requested amount, project cost, promoter contribution, and repayment or milestone plan. For ${focus}, ${first} and ${second} should tell a consistent commercial story.`,
        mismatch: `${scheme} reviewers may question ${audience} when ${first}, ${second}, and ${third} disagree about the project, quotation, registration, bank activity, or promoter. Reconcile the figures before presentation.`,
        retain: `Keep the assessed ${scheme} application version with ${first}, ${second}, lender or committee correspondence, and the sanction or rejection record. Do not overwrite the version actually presented.`,
        limits: `${scheme} finance, guarantee, subsidy, or selection decisions remain with the lender or programme body. ${audienceAtSentenceStart} should not read this guide as a promise of sanction, funding, guarantee coverage, or subsidy.`,
      };
    case "business":
      return {
        context: `${scheme} requires a business to connect its legal identity, activity, registration, transaction, and bank evidence. The review should address ${focus}; ${first} and ${second} should identify the same enterprise and relevant activity.`,
        mismatch: `${scheme} applications weaken when ${audience} show different entity names, activities, invoices, registrations, or accounts in ${first}, ${second}, and ${third}. Correct the source record that owns the mismatch.`,
        retain: `Preserve the ${scheme} submission with ${first}, ${second}, transaction or catalogue evidence, acknowledgements, and department correspondence. A ${scheme} complaint file should also show delivery, due date, and follow-up.`,
        limits: `${scheme} registration, marketplace access, complaint outcome, or recognition remains with the relevant department. This guide does not certify the business or guarantee acceptance for ${audience}.`,
      };
    default:
      return {
        context: `${scheme} depends on consistent identity and service records. ${audience} should use ${first}, ${second}, and ${third} for separate facts while checking ${focus}.`,
        mismatch: `${scheme} can fail when ${audience} have a different name, mobile, address, identifier, or service account across ${first} and ${second}. Correct the source that owns the inconsistent field.`,
        retain: `Keep the ${scheme} reference, ${first}, ${second}, service response, and exact submitted records. ${audienceAtSentenceStart} should remove unrelated personal information from a copy retained only for follow-up.`,
        limits: `${scheme} access and service decisions remain with the department or platform operator. This guide does not validate the identity in ${first} or guarantee a successful transaction for ${audience}.`,
      };
  }
}

function varyGuidance(slug: string, guidance: ReturnType<typeof categoryGuidance>) {
  const keepVerb = chooseFor(`${slug}:keep`, ["Keep", "Retain", "Archive", "Save"]);
  const preserveVerb = chooseFor(`${slug}:preserve`, ["Preserve", "Retain", "Save", "Archive"]);
  const correctionVerb = chooseFor(`${slug}:correction`, ["Correct", "Resolve", "Reconcile", "Address"]);
  const decisionPhrase = chooseFor(`${slug}:decision`, [
    "remain with",
    "are decided by",
    "depend on decisions made by",
    "are assessed by",
  ]);

  const vary = (value: string) => value
    .replace(/\bKeep the\b/g, `${keepVerb} the`)
    .replace(/\bPreserve the\b/g, `${preserveVerb} the`)
    .replace(/\bCorrect the\b/g, `${correctionVerb} the`)
    .replace(/\bremain with\b/g, decisionPhrase);

  return {
    context: vary(guidance.context),
    mismatch: vary(guidance.mismatch),
    retain: vary(guidance.retain),
    limits: vary(guidance.limits),
  };
}

function descriptionFor(scheme: string, documents: string[]) {
  const [first = "identity details", second = "supporting records"] = documents;
  return `Reconcile ${first} and ${second} for ${scheme}, then preserve the submitted reference and correction response.`;
}

function relatedLinks(meta: Frontmatter, documents: string[]) {
  const links = (meta.relatedPostIds ?? []).slice(0, 2).map((slug) =>
    `- [${sentenceCase(slug.replace(/-/g, " "))}](/blog/${slug})`);
  return [
    ...links,
    `- [Review document handling before sharing ${documents[2] ?? "application records"}](/trust)`,
    "- [Request help with an unresolved application-record issue](/expert-consultation)",
  ].join("\n");
}

function applyRouteSpecificCopyEdits(body: string, slug: string) {
  if (slug === "government-scheme-2026-kisan-credit-card-application-checklist") {
    return body
      .replace(/In the Kisan Credit Card file/g, "In the lender file")
      .replace(/Within the current Kisan Credit Card task/g, "For this farm-credit request")
      .replace(/During Kisan Credit Card follow-up/g, "During lender follow-up")
      .replace(/With Kisan Credit Card acknowledgement retained/g, "With the application acknowledgement retained")
      .replace(/Kisan Credit Card acknowledgement/g, "the application acknowledgement")
      .replace(/Kisan Credit Card application/g, "credit application")
      .replace(/For this farm-credit request, use crop details/g, "To assess the crop and borrowing need, use crop details")
      .replace(
        /For this farm-credit request, if their names, dates, amounts, or identifiers differ,/g,
        "When the farm-credit records differ in name, date, amount, or identifier,",
      )
      .replace(/For this farm-credit request, the authority/g, "For the lender decision, the authority");
  }

  if (slug !== "government-scheme-2026-pmay-urban-home-loan-record-guide") return body;

  return body
    .replace(/For this PMAY Urban 2\.0 request/g, "For this housing-support request")
    .replace(/PMAY Urban 2\.0 requires/g, "The housing programme requires")
    .replace(/PMAY Urban 2\.0 household records/g, "Household and property records")
    .replace(/Save the PMAY Urban 2\.0 reference/g, "Save the application reference")
    .replace(/later PMAY Urban 2\.0 inspection/g, "later inspection")
    .replace(/PMAY Urban 2\.0 property or household verification/g, "Property or household verification")
    .replace(/important PMAY Urban 2\.0 answers/g, "important application answers")
    .replace(/after the PMAY Urban 2\.0 submission/g, "after submission")
    .replace(/exact PMAY Urban 2\.0 answers and PMAY Urban 2\.0 acknowledgement/g, "exact submitted answers and acknowledgement")
    .replace(/Urban home buyers can prepare a complete PMAY Urban 2\.0 application/g, "Urban home buyers can prepare a complete application");
}

function sourceGuidanceFor(
  slug: string,
  scheme: string,
  audience: string,
  focus: string,
  first: string,
  second: string,
  officialSource: SourceLink | undefined,
) {
  const source = sourceMarkdown(officialSource ?? {});
  return chooseRouteVariant(slug, "human-source-guidance", [
    `${source} is the starting point for ${scheme}. ${sentenceCase(audience)} should note the current route for ${focus}, then compare the instruction with ${first} and ${second}.`,
    `Read ${source} for the current ${scheme} instruction on ${focus}. Record the date checked and identify whether ${first} or ${second} needs correction before the application is prepared.`,
    `Use ${source} to confirm who administers ${scheme} and which channel handles ${focus}. Keep the source date beside the ${first} and ${second} entries used in the file.`,
    `Open ${source} and locate the instruction that applies to ${audience}. For ${scheme}, connect that instruction to ${focus}, ${first}, and ${second} rather than relying on a general scheme summary.`,
    `The ${scheme} file should cite ${source} for the current route. Mark the instruction affecting ${focus} and the exact ${first} or ${second} field used to follow it.`,
    `Check ${source} before submitting ${first} or ${second}. The source note should identify the applicant category, the relevant ${focus} instruction, and the available correction or status channel.`,
    `For ${scheme}, verify ${focus} through ${source}. Preserve the page and date checked so a later question about ${first} or ${second} can be answered from the instruction used at submission.`,
    `Treat ${source} as the programme reference for ${scheme}. Compare its current ${focus} requirements with ${first} and ${second}, and record any state, institution, lender, or channel-specific step it identifies.`,
    `${sentenceCase(audience)} should use ${source} to verify the present ${scheme} route for ${focus}. The working note should state how ${first} and ${second} fit that route.`,
    `Start the ${scheme} source note with ${source}. Record the current instruction for ${focus}, the channel used, and any field in ${first} or ${second} that must be corrected first.`,
  ]);
}

function recordActionFor(
  slug: string,
  scheme: string,
  focus: string,
  document: string,
  nextDocument: string,
  index: number,
) {
  const role = roleFor(document);
  return chooseRouteVariant(slug, `record-action:${index}`, [
    `Read ${document} for ${role}. Compare only the field relevant to ${focus} with ${nextDocument}, and note who can correct it.`,
    `Mark the exact ${document} entry used in the ${scheme} file. Test its date, identifier, amount, or status against ${nextDocument} where both records address ${focus}.`,
    `Use ${document} to establish ${role}. Keep its issuer and relevant date beside the ${nextDocument} cross-check for ${focus}.`,
    `In the ${focus} working, state what ${document} proves and what it does not. Explain any material difference from ${nextDocument} before submission.`,
    `Connect ${document} to the proposed ${scheme} answer for ${focus}. If ${nextDocument} describes a different fact, label that difference instead of forcing the records to match.`,
    `For ${scheme}, retain the part of ${document} that supports ${role}. Record whether ${nextDocument} ${recordVerb(nextDocument, "confirms", "confirm")}, supplements, or conflicts with that fact.`,
    `Check the holder, period, issuer, and relevant field on ${document}. Use ${nextDocument} as a cross-check only where the ${focus} instruction expects the same fact.`,
    `Place ${document} beside ${nextDocument} and identify the ${focus} answer taken from each. A genuine ${scheme} conflict belongs with the issuer that owns the disputed field.`,
    `The ${scheme} note should explain why ${document} ${recordVerb(document, "is", "are")} included for ${focus}. Cite the relevant entry and record the result of comparing it with ${nextDocument}.`,
    `Trace the proposed ${focus} answer to ${document}. Preserve the source version used and document whether ${nextDocument} ${recordVerb(nextDocument, "changes", "change")} the answer or serves another purpose.`,
  ]);
}

function mismatchGuidanceFor(slug: string, scheme: string, focus: string, first: string, second: string, third: string) {
  const target = escalationTargetFor(slug);
  return chooseRouteVariant(slug, "human-mismatch-guidance", [
    `A difference between ${first} and ${second} matters only when it changes ${focus}. Route an actual error in ${third} to ${target} and keep the response.`,
    `For ${scheme}, separate harmless differences from a conflict that changes ${focus}. Identify whether ${first}, ${second}, or ${third} owns the disputed field before asking ${target} to correct it.`,
    `Compare ${first}, ${second}, and ${third} against the proposed answer for ${focus}. If the answer changes, record the affected field and take that issue to ${target}.`,
    `Do not alter ${first} merely because ${second} or ${third} looks different. For ${scheme}, decide which record controls the fact behind ${focus}, then use ${target} for a genuine correction.`,
    `A material ${scheme} mismatch is one that changes the applicant, amount, activity, asset, period, or status used for ${focus}. Record the source of that fact before contacting ${target}.`,
    `Use the ${focus} question to test the records: what does ${first} establish, what does ${second} add, and does ${third} change the proposed answer? Escalate only the unresolved ${scheme} fact to ${target}.`,
    `If ${first}, ${second}, and ${third} describe different facts, label their separate roles. If they conflict on the same ${focus} fact, preserve the originals and seek a dated response from ${target}.`,
    `For ${scheme}, write down the proposed ${focus} answer first. Then identify whether a difference in ${first}, ${second}, or ${third} requires a source-record correction through ${target}.`,
    `Treat a ${third} issue as material when it changes the ${focus} answer or blocks the current ${scheme} route. Keep the comparison with ${first} and ${second} beside any request sent to ${target}.`,
    `Resolve the record that owns the disputed ${focus} fact. A correction to ${first}, ${second}, or ${third} should be supported by the acknowledgement or response from ${target}.`,
  ]);
}

function retentionGuidanceFor(
  slug: string,
  scheme: string,
  focus: string,
  first: string,
  second: string,
  third: string,
  fourth: string,
) {
  return chooseRouteVariant(slug, "human-retention-guidance", [
    `Keep ${fourth} with the versions of ${first}, ${second}, and ${third} used for ${focus}. Add later ${scheme} responses as dated records without replacing the submission copy.`,
    `Archive the submitted ${scheme} answers, ${fourth}, and the relevant entries from ${first}, ${second}, and ${third}. Link each later status or correction message to ${focus}.`,
    `Use ${fourth} as the follow-up reference for ${scheme}. Preserve the submitted ${first}, ${second}, and ${third}, then record what changed and when.`,
    `The retained ${focus} file should connect ${fourth} to ${first}, ${second}, and ${third} as they stood on the submission date. Store later corrections separately.`,
    `Save ${fourth}, the source instruction checked, and the submitted portions of ${first}, ${second}, and ${third}. A later ${scheme} query should be answerable from that dated trail.`,
    `For follow-up on ${focus}, retain ${fourth} beside the exact ${first}, ${second}, and ${third} entries relied on. Note the sender, date, and result of every later response.`,
    `Preserve the ${scheme} submission version with ${fourth}. Keep corrections involving ${first}, ${second}, or ${third} as separate dated events so the original ${focus} answer remains visible.`,
    `Connect every later ${focus} status message to ${fourth} and the submitted records. Do not overwrite ${first}, ${second}, or ${third} after a correction is accepted.`,
    `A usable ${scheme} archive contains ${fourth}, the submitted answers, and the relevant source versions of ${first}, ${second}, and ${third}. Record later action chronologically.`,
    `Keep the ${focus} trail compact but complete: ${fourth}, submitted ${first}, ${second}, and ${third}, plus any dated correction or authority response.`,
  ]);
}

function limitationGuidanceFor(slug: string, scheme: string, audience: string, focus: string) {
  const target = escalationTargetFor(slug);
  return chooseRouteVariant(slug, "human-limitation-guidance", [
    `${sentenceCase(target)} decides the applicable ${scheme} outcome. This guide helps ${audience} prepare records for ${focus}; it does not promise approval, payment, finance, or processing time.`,
    `A complete ${focus} file can reduce avoidable questions, but ${target} controls the ${scheme} decision and timing. ${sentenceCase(audience)} must still satisfy the current instruction.`,
    `${scheme} eligibility, acceptance, and outcome remain with ${target}. The records described here support a ${focus} review and do not guarantee a benefit or service result.`,
    `This record check does not decide ${scheme} eligibility or outcome. ${sentenceCase(target)} assesses ${focus} under the current programme route.`,
    `${sentenceCase(audience)} can prepare a traceable ${focus} file, but only ${target} can decide the ${scheme} application, correction, claim, or payment.`,
    `The ${focus} working supports a ${scheme} submission; it is not a sanction, eligibility certificate, claim decision, or timing promise. Those decisions belong to ${target}.`,
    `${scheme} terms for ${focus} can change by route and applicant facts. Verify the current position with ${target}; this guide does not assure a result for ${audience}.`,
    `Records can explain ${focus}, but they cannot guarantee the ${scheme} outcome. ${sentenceCase(target)} remains the decision-maker for this ${scheme} application or follow-up.`,
    `Use this guide to prepare the ${focus} evidence. It does not replace the current ${scheme} instruction or a decision issued by ${target}.`,
    `A well-organised ${focus} file is not proof that ${scheme} will be approved or paid. ${sentenceCase(target)} applies the current programme conditions.`,
  ]);
}

function renderRegistrationSpecificBody(meta: Frontmatter) {
  const slug = meta.slug ?? "";
  const sources = (meta.sourceLinks ?? []).filter((source) => source.label && source.url);
  const sourceList = sources.map((source) => `- ${sourceMarkdown(source)}`).join("\n");
  const links = relatedLinks(meta, bodyDocumentsFor(meta));

  if (slug === "government-scheme-2026-startup-india-recognition-checklist") {
    return `# ${meta.title}

Recognition is an entity-and-activity assessment, not a general badge for every newly incorporated business. Before opening the application, confirm the legal entity, incorporation date, business activity, and the exact product, process, or service improvement that the applicant can explain with evidence.

## Decide whether the entity and application fit the recognition route

Start with the incorporation certificate and PAN because they identify the applicant that will make the declaration. Then read the current official instruction for entity type, age, turnover, restructuring, and other stated conditions. Record the condition, the supporting fact, and the document or business record behind that fact in a short eligibility note.

Do not use the pitch deck as a substitute for legal-entity evidence. Equally, do not assume that incorporation alone explains innovation or improvement. The recognition file should connect the entity named in the certificate and PAN with the activity described in the application.

Pause before applying if the business description belongs to another group entity, the product is still described only in broad promotional language, an earlier business has been split or reconstructed, or a stated condition cannot be supported from the applicant's own records.

## Write an innovation note that a reviewer can test

The useful question is not whether the business sounds modern. Explain the problem being addressed, the current alternative, what the applicant has changed or built, who uses it, and what evidence shows progress. Evidence may include a working product, dated development records, customer or pilot material, technical documentation, process measurements, intellectual-property records, or another verifiable trail appropriate to the activity.

Keep claims proportionate to the evidence. A proposal should distinguish a planned feature from a completed one, a pilot from a commercial rollout, and an internal estimate from an independently verified result. Remove unsupported market-superiority claims and explain material limitations that remain.

| Part of the file | What it should answer | Review point |
| --- | --- | --- |
| Incorporation certificate | Which legal entity is applying and when it was incorporated | Match the entity name and date with the application and PAN |
| PAN | Which taxpayer identifier belongs to the applicant | Resolve a legal-name or identifier difference before submission |
| Innovation or improvement note | What is different, useful, or improved and how that can be checked | Tie each material claim to a dated business, product, process, or customer record |
| Compliance and activity records | Whether the applicant's actual activity is consistent with the declaration | Explain differences instead of copying a generic business description |

## Review the application before submission

1. Confirm that every eligibility answer refers to the applying entity, not a founder personally or another company.
2. Read the business and innovation description for specific, verifiable claims rather than slogans.
3. Check that dates, entity names, website or product references, and activity descriptions agree where they should.
4. Preserve the submitted answers, attachments, declaration, and acknowledgement as one dated version.

An application should be held back when a material declaration remains unsupported or the person preparing it cannot explain which record establishes the answer. Recognition does not by itself establish funding, tax benefits, procurement eligibility, or acceptance under another programme; each later route has its own conditions and evidence.

## Keep the decision and later changes traceable

Save the submitted innovation note separately from later pitch revisions. If the authority asks a question, answer against the version it reviewed and keep the question, response, attachment, and date together. Where the legal entity, activity, or product description changes later, retain the earlier file rather than rewriting the history.

For an entity-record error, use the correction route owned by the relevant issuer. For an application-status or recognition question, use the official programme channel and retain its response with the acknowledgement.

## Official references checked for this guide

${sourceList}

## Related startup and document-readiness guides

${links}
`;
  }

  if (slug === "government-scheme-2026-pmfme-food-processing-micro-unit-checklist") {
    return `# ${meta.title}

A PMFME file should describe a real food-processing unit closely enough for a lender or programme reviewer to understand what will be made, where it will be made, what equipment is needed, how much it will cost, and how the applicant expects the unit to operate. Identity and bank records matter, but they cannot replace the operating and finance case.

## Describe the unit before collecting quotations

Write a one-page unit note covering the product, raw material, process steps, existing or proposed capacity, premises, utilities, storage, packaging, labour, sales route, and current stage. State whether the applicant is upgrading an operating unit or proposing a new activity under the applicable route. Avoid broad phrases such as “food business” when the actual unit can be described precisely.

Map the production flow from incoming raw material to the finished product. This exposes practical gaps such as missing cleaning, testing, cold storage, power, water, waste handling, packaging, or transport assumptions. A quotation should then connect to a stated process requirement rather than appear as an isolated equipment price.

## Build a cost and finance bridge

Prepare one cost table that separates equipment, installation, civil or premises work, utilities, licences or professional costs, working capital, applicant contribution, proposed finance, and any programme-linked support being considered. Identify the source and date of each estimate.

| Cost or finance item | Evidence to keep | Question to resolve |
| --- | --- | --- |
| Equipment and installation | Comparable quotations, specifications, capacity, taxes, and delivery terms | Does the equipment fit the stated process and output? |
| Premises and utilities | Ownership, lease, consent, layout, and utility information as applicable | Can the proposed unit lawfully and practically operate at the site? |
| Applicant contribution | Bank trail and source explanation | Is the contribution available and connected to the same proposal? |
| Finance request | Project estimate, repayment assumptions, and lender correspondence | Does the request match the cost table and expected operation? |
| Working capital | Raw-material, packaging, labour, stock, and receivable assumptions | Are the operating assumptions explained rather than inserted as a round figure? |

Do not present subsidy as money already sanctioned. Keep the total project cost, applicant contribution, requested finance, and any programme support as separate figures until the lender or programme office confirms the applicable treatment.

## Connect approvals to the actual product and premises

List the food-business, local, environmental, tax, or other registrations and permissions relevant to the proposed unit and stage. Record what each one establishes, its holder, premises, product scope, status, and validity where applicable. A registration for another location, product, or entity should not be used without explaining the difference.

Keep product and packaging claims evidence-led. Where a label, quality claim, shelf-life statement, or specification is material to the proposal, identify the record or testing behind it. Do not use a general registration certificate as proof of every product or performance claim.

## Check whether the proposal can be reviewed

1. Confirm that the applicant, enterprise, bank account, premises, and proposed unit refer to the same project.
2. Reconcile the project report with equipment quotations and the cost table.
3. Explain capacity, raw-material supply, production flow, sales assumptions, and working-capital need.
4. Identify approvals already held, approvals still required, and the owner of each pending action.
5. Preserve the exact proposal, attachments, lender or programme questions, and submitted acknowledgement.

Pause when the project description and quotations do not match, the premises position is unclear, applicant contribution lacks a traceable source, or the finance request depends on unsupported sales or subsidy assumptions.

## Track appraisal, purchase, and implementation separately

After submission, keep lender appraisal questions, programme communication, sanction or rejection, conditions, purchases, payments, installation, training, inspection, and production milestones by date. Do not overwrite the proposal version that was assessed. If the project scope changes, record the change, reason, revised cost, and authority or lender response.

This guide supports project-file preparation. It does not promise finance, subsidy, approval, procurement acceptance, or processing time; those decisions remain with the lender and programme bodies applying the current route.

## Official references checked for this guide

${sourceList}

## Related food-business and finance-readiness guides

${links}
`;
  }

  if (slug === "government-scheme-2026-startup-india-seed-fund-readiness-guide") {
    return `# ${meta.title}

A seed-fund application is an incubator assessment of a particular startup, problem, solution, team, evidence, funding need, and milestone plan. It should not read like a generic loan application or a rewritten recognition note. Prepare the version that a committee can question and that the startup can later report against.

## Define the assessment case

Begin with the exact problem being addressed and the user or customer affected. Explain the current alternative, why it is inadequate, what the startup has built or tested, and what remains uncertain. Separate completed work from planned work and distinguish direct evidence from assumptions.

Connect the applying legal entity and recognition status to the team and product described in the proposal. If intellectual property, customer relationships, technology, data, contracts, or prior work sit with another entity or founder personally, explain the ownership or usage position before presenting them as startup assets.

## Assemble evidence of progress

Use a compact evidence index rather than attaching every available file. For each important claim, identify the dated record and the conclusion it supports.

| Assessment question | Useful evidence | Weak substitute to avoid |
| --- | --- | --- |
| Is the problem real and specific? | User interviews, pilot records, demand evidence, or credible domain data | A broad market-size claim with no link to the proposed user |
| Has the solution progressed? | Demonstration, technical record, test result, product log, or pilot outcome | A feature list that does not show what currently works |
| Can the team execute? | Roles, relevant work, commitments, and identified capability gaps | Titles alone or experience unrelated to the proposed milestones |
| Is the use of funds coherent? | Cost basis, vendor or hiring assumptions, and milestone budget | A round funding request divided into generic percentages |
| Can progress be measured? | Dated deliverables, acceptance criteria, and reporting evidence | Aspirational outcomes without a verifiable completion test |

State limitations and adverse evidence where material. A failed pilot, delayed build, unresolved regulatory question, or uncertain customer assumption may change the plan, but hiding it leaves the committee unable to assess the actual risk.

## Turn the funding request into milestones

For every requested amount, identify the intended use, timing, owner, deliverable, and evidence of completion. Link hiring, product development, testing, market validation, certification, or commercial work to a measurable milestone. Keep operating expenses and founder or related-party payments transparent.

The milestone plan should show dependencies. For example, a field pilot may depend on a working prototype and permission; a commercial rollout may depend on testing, support capacity, or regulatory work. Explain what the startup will do if a dependency is delayed or an assumption proves wrong.

## Review the submission as an assessed version

1. Confirm the applying entity, recognition details, founders, and cap-table information used in the proposal.
2. Tie material product, market, traction, and impact claims to dated evidence.
3. Reconcile the requested support with the milestone budget and other funding sources.
4. Identify conflicts, related-party arrangements, existing obligations, and material conditions honestly.
5. Save the exact pitch, application, attachments, declarations, and acknowledgement submitted to the incubator.

Pause where the proposal depends on unsupported traction, another entity owns core work without explanation, the requested amount cannot be connected to deliverables, or the team cannot describe how milestone completion will be evidenced.

## Preserve committee questions and milestone reporting

Keep each incubator or committee question with the answer and proposal version it concerns. If the startup revises the pitch after feedback, retain both versions and record what changed. Later reporting should connect expenditure and progress to the accepted milestones rather than retrofitting a new story after funds are used.

Selection, disbursement, instrument terms, milestone acceptance, and later support remain with the incubator and programme bodies applying the current rules. This guide helps organise an assessable file; it does not promise selection or funding.

## Official references checked for this guide

${sourceList}

## Related startup and funding-readiness guides

${links}
`;
  }

  if (slug !== "government-scheme-2026-udyam-registration-msme-checklist") return null;

  return `# ${meta.title}

An Udyam certificate is the output of enterprise facts held across several source systems. The useful preparation task is to identify who owns each fact, check whether it describes the same enterprise and period, and correct a genuine source error before carrying inconsistent information into the registration.

## Start with the enterprise and its source registrations

Identify the constitution of the enterprise and the person whose Aadhaar is used for the applicable registration route. Match that position with PAN and, where relevant, GST registration and enterprise records. A name, identifier, or constitution difference should be investigated at the source that owns it; editing an unrelated document for visual consistency creates a weaker trail.

Build a one-page source map before registering or updating:

| Enterprise fact | Primary place to verify it | What to retain |
| --- | --- | --- |
| Applicant or authorised-person identity | Applicable Aadhaar and constitutional records | The relevant identity entry and any correction acknowledgement |
| Enterprise PAN and legal name | PAN and entity records | The PAN record used and explanation of any naming difference |
| GSTIN, where applicable | GST registration and current status | The registration detail relevant to the enterprise and period |
| Activity classification | Actual products, services, operations, invoices, or licences | A short explanation supporting the selected activity codes |
| Turnover and investment information | Applicable source data and financial records | The period, source, and reconciliation used for a material difference |

## Choose activity codes from work actually performed

Describe the enterprise's current products, services, and operating activities in plain language before choosing classifications. Separate manufacturing from services where the facts require it, and do not select an activity merely because it sounds broader or may appear useful for a future tender or benefit.

For a mixed-activity enterprise, keep a short note explaining each material line of work and the record that shows it. Invoices, licences, contracts, product records, and accounts can help establish the activity; a copied website phrase or proposed future service cannot establish current operations by itself.

## Reconcile turnover and registration differences

Use the period and source stated by the current official route. Where PAN, GST, financial, or portal information differs, first decide whether the records cover different periods or scopes. If the difference is material and concerns the same fact, document the owner of that source, the correction or explanation pursued, and the response received.

Do not overwrite an older certificate when an enterprise detail changes. Keep the prior certificate, update acknowledgement, revised certificate, and the source record that explains the change. That sequence matters when a customer, lender, department, or auditor asks which enterprise facts applied on an earlier date.

Keep the working narrow enough to reproduce. For each material value, note the source system, period, date checked, person who reviewed it, and reason for any adjustment or explanation. That record makes a later update easier to distinguish from an unresolved registration error.

## Control list before registration or update

1. Verify the enterprise constitution and the applicable Aadhaar-linked applicant or authorised person.
2. Confirm the PAN, legal name, and GST position where applicable.
3. Explain selected activity classifications from actual operations.
4. Reconcile material period or scope differences in turnover and investment information.
5. Retain the submitted details, acknowledgement, certificate, and every later update as dated records.

Registration does not certify product quality, payment capacity, tender eligibility, loan approval, or entitlement under another programme. Use the certificate only for the fact and period it can support, and check the separate requirements of any receiving authority.

## Official references checked for this guide

${sourceList}

## Related MSME and record-management guides

${links}
`;
}

function renderHumanBody(meta: Frontmatter) {
  const registrationSpecificBody = renderRegistrationSpecificBody(meta);
  if (registrationSpecificBody) return registrationSpecificBody.trim();

  const scheme = cleanSchemeName(meta);
  const documents = bodyDocumentsFor(meta);
  const focus = focusFor(meta);
  const sources = (meta.sourceLinks ?? []).filter((source) => source.label && source.url);
  const slug = meta.slug ?? scheme;
  const routeNote = routeNotes[slug];
  if (!routeNote) throw new Error(`Missing route-specific editorial note for ${slug}`);
  const routeDecisionNote = routeDecisionNotes[slug];
  const routeDifferentiator = routeDifferentiators[slug];
  const editorialDepth = governmentSchemeEditorialDepth[slug];
  if (!editorialDepth) throw new Error(`Missing route-specific editorial depth for ${slug}`);
  const officialSource = sources.find((source) => !/^myscheme\b/i.test(source.label ?? "")) ?? sources[0];
  const sourceList = sources.map((source) => `- ${sourceMarkdown(source)}`).join("\n");

  return applyRouteSpecificCopyEdits(`# ${meta.title}

${routeNote}

${routeDecisionNote ? `${routeDecisionNote}\n` : ""}
${routeDifferentiator ? `${routeDifferentiator}\n` : ""}
${editorialDepth}

## ${scheme}: source pages and next actions

Read ${sourceMarkdown(officialSource ?? {})} for the current instruction affecting ${focus}. Keep that ${scheme} page and its check date with the application record, and route an error in the underlying source to the issuer or programme channel that owns the disputed fact.

${sourceList}

${relatedLinks(meta, documents)}
`, slug);
}

function renderBody(meta: Frontmatter) {
  const scheme = cleanSchemeName(meta);
  const audience = audienceFor(meta);
  const documents = bodyDocumentsFor(meta);
  const focus = focusFor(meta);
  const sources = (meta.sourceLinks ?? []).filter((source) => source.label && source.url);
  const officialSource = sources.find((source) => !/^myscheme\b/i.test(source.label ?? "")) ?? sources[0];
  const routeNote = routeNotes[meta.slug ?? ""];
  if (!routeNote) throw new Error(`Missing route-specific editorial note for ${meta.slug}`);
  const routeDecisionNote = routeDecisionNotes[meta.slug ?? ""];
  const routeDifferentiator = routeDifferentiators[meta.slug ?? ""];
  const slug = meta.slug ?? scheme;
  const reviewLens = reviewLensFor(slug);
  const [first, second, third, fourth] = [
    documents[0] ?? "identity proof",
    documents[1] ?? "supporting record",
    documents[2] ?? "bank or payment record",
    documents[3] ?? `${scheme} acknowledgement`,
  ];
  const caseLabel = "application file";
  const recordRows = documents.map((document, index) => {
    const nextDocument = documents[(index + 1) % documents.length] ?? "the application";
    return `| ${sentenceCase(document)} | ${bodyRoleFor(document)} | ${bodyComparisonFor(document, nextDocument, focus)} |`;
  }).join("\n");

  const sourceRows = sources.map((source) => {
    const use = /^myscheme\b/i.test(source.label ?? "")
      ? `Locate the responsible department, then confirm ${focus} on that department's current page.`
      : `Verify the current ${scheme} route, the ${first} requirement, and any status or correction channel for ${focus}.`;
    return `| ${sourceMarkdown(source)} | ${use} |`;
  }).join("\n");

  const sourceIntro = chooseFor(`${slug}:source-intro`, [
    `Open ${sourceMarkdown(officialSource ?? {})}; enter the page, date checked, applicant category, and channel in the ${reviewLens}.`,
    `Use ${sourceMarkdown(officialSource ?? {})} to confirm access and authority questions; preserve that result in the ${reviewLens}.`,
    `Read ${sourceMarkdown(officialSource ?? {})} before uploading ${first}; attach the instruction to the ${reviewLens}.`,
    `Check ${sourceMarkdown(officialSource ?? {})} for the current route; compare ${first} and ${second} through the ${reviewLens}.`,
    `Treat ${sourceMarkdown(officialSource ?? {})} as the starting source; put deadlines and correction channels in the ${reviewLens}.`,
  ]);
  const mismatchIntro = chooseFor(`${slug}:mismatch-intro`, [
    `Compare ${first} with ${second}. If a material field differs, name the correcting issuer in the ${reviewLens}.`,
    `Read ${first} and ${second} side by side. The ${reviewLens} should explain the source difference before the relevant ${third} entry is used.`,
    `Trace the important ${scheme} answers from ${first} to ${second}. Put correction guidance in the ${reviewLens}.`,
    `Use ${first} for ${bodyRoleFor(first).toLowerCase()}. Resolve the related ${second} conflict through the ${reviewLens}.`,
    `Trace the submitted ${scheme} answer to ${first} and ${second}. Record who controls ${third} and whether a correction is still open.`,
  ]);
  const limitation = chooseFor(`${slug}:limitation`, [
    `The evidence gathered for ${caseLabel} can support a review, but it cannot promise approval, subsidy, benefit, finance, or processing time for ${audience}.`,
    `${sentenceCase(audience)} can prepare a complete file; the programme operator still decides eligibility, acceptance, and outcome.`,
    `The authority still controls the decision and timing even when ${first}, ${second}, and ${third} are complete.`,
    `A complete ${caseLabel} reduces avoidable record gaps, but ${audience} must still satisfy the current programme instruction.`,
    `Preparing the ${caseLabel} is an evidence task for ${audience}, not a guarantee that the application or claim will succeed.`,
  ]);
  const settlementParagraph = chooseFor(`${slug}:settlement`, [
    `Begin the ${reviewLens} with ${first}. Use ${second} to test only the part of ${focus} that the relevant ${second} entry can establish, and reserve ${third} for its own fact. If a material answer remains uncertain, identify the issuer or programme office that can settle it before submission.`,
    `Write the proposed answer to ${focus} at the top of the ${reviewLens}. Mark the supporting entry in ${first}, compare the relevant entry in ${second}, and explain why the relevant ${third} entry is included. Any unresolved field should carry the name of the record owner or authority responsible for correcting it.`,
    `Before applying, map ${focus} to ${first}, ${second}, and ${third}. The map should show which record supplies each answer and which differences are harmless because the records describe different facts. Send a genuine error back to the issuer that controls the affected record.`,
    `Treat ${focus} as a decision, not an upload exercise. Decide what the relevant ${first} entry establishes, what must be confirmed through ${second}, and what limited role the relevant ${third} entry plays. Record the correct correction channel beside any answer that cannot yet be supported.`,
    `Use the ${reviewLens} to separate the applicant fact in ${first} from the programme fact in ${second} and the supporting detail in ${third}. Do not force the records to match where they answer different questions; document who must resolve a material conflict.`,
    `For ${focus}, first identify the answer the programme asks for. Trace that answer to ${first}, verify the related detail through ${second}, and check whether the relevant ${third} entry is current for the person, period, activity, or asset. Pause if the responsible issuer has not resolved a material error.`,
    `A usable ${reviewLens} should explain how ${first}, ${second}, and ${third} support ${focus}. Note the issuer, relevant date, and field used from each record. Where an important field is wrong, route the correction to the authority that owns that source rather than altering an unrelated document.`,
    `Set out the evidence for ${focus} in the order a reviewer would need it: ${first}, then ${second}, then ${third}. Explain any difference that changes the submitted answer and identify the source record that needs attention. A difference that does not affect the request should be labelled as such.`,
  ]);
  const decisionParagraph = chooseFor(`${slug}:decision-paragraph`, [
    `Treat ${first}, ${second}, and ${third} as separate witnesses to ${focus}. Write down the answer taken from each record, the issuer responsible for it, and the date or period it covers. A difference is not automatically an error when the records answer different questions; the ${reviewLens} should state whether it changes the application answer.`,
    `Start the ${reviewLens} with the exact answer requested for ${focus}. Trace that answer to ${first}, then test it against ${second} and ${third}. If their names, dates, amounts, or identifiers differ, explain why and identify the source that needs correction instead of changing an unrelated record for cosmetic consistency.`,
    `Build a chronology for ${focus}: note when the relevant ${first} entry was issued, when the relevant ${second} entry changed, when the relevant ${third} entry was checked, and when ${fourth} was received. That dated sequence distinguishes an older record from a current conflict and shows which application route was used even if a portal screen later changes.`,
    `Use the ${reviewLens} to record one of three findings for ${focus}: agreement, a source-record correction, or a question for the programme authority. Do not force ${first} and ${second} into agreement when they describe different facts. The unresolved point should remain visible until the applicant chooses to submit, wait, or seek correction.`,
    `For ${focus}, identify the smallest evidence set that supports the proposed answer. Use ${first} for ${roleFor(first)}, while ${second} and ${third} should contribute only the facts they contain. Remove unrelated material before sharing the file so the ${reviewLens} does not expose information the authority did not request.`,
  ]);
  const followUpParagraph = chooseFor(`${slug}:follow-up-paragraph`, [
    `After submission, compare each status message with ${fourth} and the copy of ${first} used at the time. If the authority asks for ${second} or ${third}, first record the exact question. The ${reviewLens} should show who responded, what changed, and whether the response replaces or supplements an earlier answer.`,
    `Answer a later ${focus} query from the submitted version preserved with ${fourth}. Keep the source page and ${reviewLens} beside that version. If any source entry changes later, retain both copies and note the effective date so the authority can identify the facts used at submission.`,
    `Use ${fourth} as the follow-up anchor for the ${reviewLens}. Record status dates, correction references, and requests involving ${first}, ${second}, or ${third}. When a correction is accepted, keep the original file and the authority response because together they explain why the final record changed.`,
    `Keep ${focus} open in the ${reviewLens} until ${fourth} connects to the exact submitted answers and records. Assign an owner and next action to any remaining difference in ${first}, ${second}, or ${third}. That trail lets a later status or document request be answered from the application history.`,
  ]);
  const correctionParagraph = chooseFor(`${slug}:correction`, [
    `When ${first}, ${second}, or ${third} contains a material error, send the correction to the issuer that controls that record. File the request, response, revised version, and effective date beside ${fourth} so the ${reviewLens} shows why the application answer changed.`,
    `Do not repair a conflict in ${focus} by editing a different record. Ask the owner of ${first}, ${second}, or ${third} to correct the affected field, then connect its acknowledgement and revised record to ${fourth} in the ${reviewLens}.`,
    `A source-record error belongs with its issuer. For the ${reviewLens}, retain the correction request involving ${first}, ${second}, or ${third}, the authority's reply, the updated record, and the date from which the corrected fact applies.`,
    `If ${focus} cannot be supported because one record is wrong, identify whether ${first}, ${second}, or ${third} owns the disputed fact. Use that issuer's correction route and place the resulting response and revised evidence with ${fourth}.`,
    `Resolve a genuine conflict at source. The ${reviewLens} should connect any request to amend ${first}, ${second}, or ${third} with the answer from ${escalationTargetFor(slug)} and the version ultimately used alongside ${fourth}.`,
    `For a material mismatch, write down the disputed field, the record that owns it, and the correction channel. Keep the exchange concerning ${first}, ${second}, or ${third} with ${fourth}; this preserves the reason for any later change to ${focus}.`,
  ]);
  const questionParagraph = chooseFor(`${slug}:questions`, [
    `Before submission, use the ${reviewLens} to answer four practical questions: what ${first} establishes for ${focus}; where ${second} should agree or differ; which issuer controls ${third}; and how ${fourth} will identify the submitted version during follow-up.`,
    `Test the proposed ${focus} answer by asking whether ${first} belongs to the correct applicant or activity, which field in ${second} matters, what ${third} cannot establish, and whether ${fourth} preserves the exact version sent to the authority.`,
    `The ${reviewLens} is ready only when it explains why ${first} is relevant, whether the same material fact is supported by ${second}, who can resolve a problem in ${third}, and which response date or next action belongs with ${fourth}.`,
    `Read the file from a reviewer’s perspective: identify the answer supported by ${first}, the separate fact supplied by ${second}, the correction owner for ${third}, and the status trail connected to ${fourth}. Record any unanswered point before applying.`,
    `For ${focus}, confirm the right applicant, period, account, activity, or asset through ${first}; compare only the relevant part of ${second}; state the limited role of ${third}; and preserve ${fourth} as the reference for every later response.`,
  ]);
  const retentionParagraph = chooseFor(`${slug}:retention`, [
    `Store ${fourth} with the exact answer supported by ${first}, the relevant entry from ${second}, and the dated copy of ${third} used in the ${reviewLens}. Add each authority response beside the issue it resolves, while leaving the original submitted version intact.`,
    `The retained ${reviewLens} should connect ${fourth} to ${first}, ${second}, and ${third} as they stood on the submission date. Keep later corrections and status responses as separate dated entries so the earlier application record is not overwritten.`,
    `Preserve the submitted answer, ${fourth}, and the source versions of ${first}, ${second}, and ${third}. For every correction or status response, record the reply from ${escalationTargetFor(slug)}, response date, outcome, and next action in the ${reviewLens}.`,
    `Keep a submission pack containing ${fourth}, the entries used from ${first} and ${second}, and the relevant ${third} copy. The ${reviewLens} should show later messages and corrected records chronologically without replacing what was originally sent.`,
    `For follow-up on ${focus}, retain ${fourth} beside the supporting parts of ${first}, ${second}, and ${third}. Link a correction response to the specific disputed field and keep its date and next step visible in the ${reviewLens}.`,
    `Archive the ${reviewLens} version used at submission together with ${fourth}. It should identify the portions of ${first}, ${second}, and ${third} relied on, then record later authority replies without erasing the earlier evidence trail.`,
  ]);
  const escalationParagraph = chooseFor(`${slug}:escalation`, [
    `Take an unresolved ${focus} question to ${escalationTargetFor(slug)} when ${first}, ${second}, and ${third} cannot settle it. Add the advice, date, responder, and application reference to the ${reviewLens}.`,
    `If the ${reviewLens} still shows a material conflict after checking ${first}, ${second}, and ${third}, ask ${escalationTargetFor(slug)} for the applicable route. Preserve that response with ${fourth}.`,
    `Escalate only the unresolved fact behind ${focus}. Give ${escalationTargetFor(slug)} the relevant entries from ${first}, ${second}, and ${third}, then record the response and next action beside ${fourth}.`,
    `For a conflict that the source records cannot resolve, seek a dated answer from ${escalationTargetFor(slug)}. The ${reviewLens} should connect that advice to ${focus}, the affected record, and ${fourth}.`,
    `Ask ${escalationTargetFor(slug)} to clarify the remaining ${focus} issue after documenting what ${first}, ${second}, and ${third} each establish. Retain the authority response in the ${reviewLens} follow-up trail.`,
  ]);
  const paragraphContext = { reviewLens, focus, first, second, third, fourth, audience, scheme };
  const contextualizedSourceIntro = contextualizeParagraph(sourceIntro, `${slug}:source-intro`, paragraphContext);
  const contextualizedMismatchIntro = contextualizeParagraph(mismatchIntro, `${slug}:mismatch-intro`, paragraphContext);
  const contextualizedLimitation = contextualizeParagraph(limitation, `${slug}:limitation`, paragraphContext);
  const contextualizedSettlement = contextualizeParagraph(settlementParagraph, `${slug}:settlement`, paragraphContext);
  const contextualizedDecision = contextualizeParagraph(decisionParagraph, `${slug}:decision`, paragraphContext);
  const contextualizedCorrection = contextualizeParagraph(correctionParagraph, `${slug}:correction`, paragraphContext);
  const contextualizedQuestions = contextualizeParagraph(questionParagraph, `${slug}:questions`, paragraphContext);
  const contextualizedRetention = contextualizeParagraph(retentionParagraph, `${slug}:retention`, paragraphContext);
  const contextualizedFollowUp = contextualizeParagraph(followUpParagraph, `${slug}:follow-up`, paragraphContext);
  const contextualizedEscalation = contextualizeParagraph(escalationParagraph, `${slug}:escalation`, paragraphContext);

  return applyRouteSpecificCopyEdits(`# ${meta.title}

${routeNote}

${routeDecisionNote ? `${routeDecisionNote}\n` : ""}
${routeDifferentiator ? `${routeDifferentiator}\n` : ""}
## ${sentenceCase(focus)}: facts to settle before applying

${contextualizedSettlement}

${contextualizedDecision}

## ${sentenceCase(first)} and ${sentenceCase(second)}: official and correction routes

${contextualizedSourceIntro}

| Official reference | Current ${focus} check |
| --- | --- |
${sourceRows}

## ${sentenceCase(reviewLens)}: what each record can show

For ${focus}, read ${first} for ${roleFor(first)} and ${second} for ${roleFor(second)}. In the ${scheme} application, compare them only where the current instruction expects the same applicant, period, activity, or asset.

| Application record | Fact used for ${focus} | Cross-check before submission |
| --- | --- | --- |
${recordRows}

## ${scheme}: correcting ${sentenceCase(first)}

${contextualizedMismatchIntro}

${contextualizedCorrection}

${contextualizedQuestions}

## Keep ${sentenceCase(fourth)} with the supporting records

${contextualizedRetention}

${contextualizedLimitation}

${contextualizedFollowUp}

${contextualizedEscalation}

## ${scheme}: continue with ${sentenceCase(first)} or ${sentenceCase(second)}

${relatedLinks(meta, documents)}
`, slug);
}

async function main() {
  const fileNames = (await fs.readdir(blogDir))
    .filter((fileName) => /^government-scheme-2026-.*\.mdx$/.test(fileName));
  let changed = 0;

  for (const fileName of fileNames) {
    const filePath = path.join(blogDir, fileName);
    const source = await fs.readFile(filePath, "utf8");
    const match = source.match(frontmatterPattern);
    if (!match) throw new Error(`Missing JSON frontmatter in ${fileName}`);
    const meta = JSON.parse(match[1]) as Frontmatter;
    const documents = documentsFor(meta);
    if (documents.length < 3) throw new Error(`${fileName} needs at least three route-specific records`);

    const scheme = cleanSchemeName(meta);
    const officialSource = (meta.sourceLinks ?? []).find((source) => !/^myscheme\b/i.test(source.label ?? "")) ??
      meta.sourceLinks?.[0];
    const [first, second, third, fourth] = [
      documents[0],
      documents[1],
      documents[2],
      documents[3] ?? "the acknowledgement",
    ];
    const slug = meta.slug ?? scheme;
    const editorialLabel = editorialLabels[slug] ?? scheme;
    const focus = focusFor(meta);
    const description = descriptionFor(scheme, documents);

    meta.description = description;
    meta.excerpt = description;
    meta.seoDescription = description;
    meta.modifiedAt = modifiedAt;
    meta.qualityStatus = "needs_revision";
    meta.targetAudience = buildSchemeTargetAudience(audienceFor(meta), scheme, documents);
    meta.keyHighlights = [
      `${editorialLabel} evidence check: use ${first} with ${second} only for the facts those records establish.`,
      `${editorialLabel} correction path: send a material ${third} difference to ${escalationTargetFor(slug)} and file the response beside ${fourth}.`,
      `${editorialLabel} follow-up record: retain ${fourth} with the submitted ${first}, ${second}, and ${third}.`,
    ];
    meta.keyTopics = [focus, ...documents];
    meta.steps = [
      `${editorialLabel} instructions: verify ${focus} on ${officialSource?.label ?? `the official scheme page`}.`,
      `${editorialLabel} evidence pair: ${comparisonFor(first, second)}`,
      `${editorialLabel} mismatch handling: use ${escalationTargetFor(slug)} for a material ${third} difference and retain the dated reply.`,
      `${editorialLabel} retention step: connect ${fourth} to the submitted ${first}, ${second}, and ${third}.`,
    ];

    const body = renderHumanBody(meta).trim();
    await fs.writeFile(filePath, `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${body}\n`, "utf8");
    changed += 1;
  }

  console.log(`Rewrote ${changed} government-scheme guides with source-aware, record-specific content.`);
}

await main();

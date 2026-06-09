export interface SchemeEditorialCleanupContext {
  title: string;
  primaryKeyword: string;
  focus: string;
  documents: string[];
  sourceLabel: string;
}

function recordAt(context: SchemeEditorialCleanupContext, index: number) {
  return context.documents[index] ?? context.documents[0] ?? "the supporting record";
}

function verbFor(value: string, singular: string, plural: string) {
  return /\band\b|\bor\b|\bdetails\b|\brecords\b|\bstatements\b|\bdocuments\b|\bpapers\b|\bcertificates\b/i.test(value)
    ? plural
    : singular;
}

export function cleanSchemeEditorialBody(body: string, context: SchemeEditorialCleanupContext) {
  const first = recordAt(context, 0);
  const second = recordAt(context, 1);
  const third = recordAt(context, 2);
  const source = context.sourceLabel || "the official authority page";
  const replacements: Array<[RegExp, string]> = [
    [
      /\blive authority route and their own records\b|\bnot a copied checklist\b/i,
      `${context.title} starts with three concrete checks: whether ${first} ${verbFor(first, "identifies", "identify")} the right applicant, ${second} ${verbFor(second, "supports", "support")} the claimed condition, and ${third} ${verbFor(third, "fits", "fit")} the current instructions on ${source}.`,
    ],
    [
      /\bcomplete upload set containing\b/i,
      `Having ${first}, ${second}, and ${third} ready does not resolve a contradiction among them. The unresolved ${context.primaryKeyword} fact should name the issuing record, correction owner, and evidence required before submission.`,
    ],
    [
      /\bevidence set around four questions\b/i,
      `Assign a distinct purpose to ${first}, ${second}, and ${third}; note the issuer, relevant date, applicant detail, and application answer each record supports.`,
    ],
    [
      /\bthe decision to record is\b/i,
      `Use ${source} to confirm the current application channel and accepted records, then decide whether ${first} and ${second} support the requested ${context.primaryKeyword} outcome.`,
    ],
    [
      /\bsource checks should answer four practical points\b/i,
      `The ${source} review should identify the deciding authority, application channel, accepted use of ${third}, and the follow-up route after submission.`,
    ],
    [
      /\bsimple pre-submission check by tracing one material\b/i,
      `Before submission, trace one material ${context.primaryKeyword} answer from ${source} to ${first}, ${second}, and ${third}, and record any correction still required.`,
    ],
    [
      /\bshould not be used to hide a conflict\b/i,
      `Use ${third} only for the fact it proves. If ${first} and ${second} conflict, correct the issuing record or obtain written guidance before submission.`,
    ],
    [
      /\blive route asks for a fact absent from\b/i,
      `If the current ${context.primaryKeyword} route asks for a fact absent from ${first} and ${second}, obtain the accepted record or written clarification before submission.`,
    ],
    [
      /\banswer different questions\b/i,
      `${first}, ${second}, and ${third} each support a different part of ${context.primaryKeyword}; do not use one record as a substitute for another.`,
    ],
  ];

  return body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;
      const repaired = line
        .replace(
          "Record which issuer must correct the disputed fact before submission.",
          `The unresolved ${context.primaryKeyword} fact should name the issuing record, correction owner, and evidence required before submission.`,
        )
        .replace(
          "Resolve an incomplete or inconsistent detail before submission.",
          `Resolve any incomplete or inconsistent ${context.primaryKeyword} detail before submission.`,
        )
        .replace(
          "Save the checked copy with the final acknowledgement.",
          `Save the checked ${context.primaryKeyword} evidence with the final acknowledgement.`,
        )
        .replace(
          "If the portal asks for a different format or issuing record, follow the current authority instruction.",
          `For ${context.primaryKeyword}, use the format and issuing record named in the current authority instruction.`,
        )
        .replace(
          "Do not use either record for a fact it does not contain.",
          `For ${context.primaryKeyword}, use each record only for the fact it actually contains.`,
        )
        .replace(
          "A conflict between them needs correction or written clarification.",
          `Resolve any ${context.primaryKeyword} conflict through source-record correction or written clarification.`,
        )
        .replace(`${first} identifies`, `${first} ${verbFor(first, "identifies", "identify")}`)
        .replace(`${second} supports`, `${second} ${verbFor(second, "supports", "support")}`)
        .replace(`${third} fits`, `${third} ${verbFor(third, "fits", "fit")}`);
      if (/^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|\|)/.test(line.trim())) return repaired;
      const replacement = replacements.find(([pattern]) => pattern.test(repaired));
      return replacement?.[1] ?? repaired;
    })
    .join("\n");
}

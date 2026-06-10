export type ItrDeadlineCategory = "salaried" | "business-profession" | "unknown";

const disclaimer = "Confirm the due date and any extension on the official Income Tax e-Filing portal before filing.";

export function getItrDeadlineMessage(category: ItrDeadlineCategory) {
  if (category === "business-profession") {
    return {
      categoryLabel: "Non-audit business and profession returns",
      dateLabel: "August 31, 2026",
      disclaimer,
    };
  }

  if (category === "salaried") {
    return {
      categoryLabel: "Salaried and other non-business individual returns",
      dateLabel: "July 31, 2026",
      disclaimer,
    };
  }

  return {
    categoryLabel: "Your filing category determines the applicable due date",
    dateLabel: "July 31 or August 31, 2026",
    disclaimer,
  };
}

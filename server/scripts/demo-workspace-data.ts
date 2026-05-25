export const DEMO_WORKSPACE_SEED_ID = "myeca-demo-workspace-v1";

export const DEMO_WORKSPACE_COLLECTIONS = [
  "users",
  "profiles",
  "user_services",
  "tax_returns",
  "documents",
  "consultation_requests",
  "payment_link_requests",
  "notifications",
] as const;

export type DemoWorkspaceCollection = typeof DEMO_WORKSPACE_COLLECTIONS[number];

export type DemoWorkspaceRecord = {
  id: string;
  data: Record<string, unknown>;
};

export type DemoWorkspaceSeed = Record<DemoWorkspaceCollection, DemoWorkspaceRecord[]>;

const DEMO_CA = {
  id: "temporary_test_ca",
  name: "CA Demo Tester",
  email: "test.ca@myeca.in",
};

const DEMO_ADMIN = {
  id: "temporary_test_admin",
  email: "test.admin@myeca.in",
};

function marker(now: Date) {
  return {
    demoSeed: DEMO_WORKSPACE_SEED_ID,
    isDummyData: true,
    cleanupCommand: "npm.cmd run db:seed:demo:cleanup",
    createdAt: now,
    updatedAt: now,
  };
}

function record(id: string, now: Date, data: Record<string, unknown>): DemoWorkspaceRecord {
  return {
    id,
    data: {
      id,
      ...marker(now),
      ...data,
    },
  };
}

function assignedCaFields() {
  return {
    assignedCaId: DEMO_CA.id,
    assignedCaName: DEMO_CA.name,
    assignedCaEmail: DEMO_CA.email,
  };
}

function assignedCaMetadata() {
  return {
    assignedCa: {
      id: DEMO_CA.id,
      name: DEMO_CA.name,
      email: DEMO_CA.email,
    },
  };
}

function demoDocument(
  id: string,
  now: Date,
  input: {
    category: string;
    fileName: string;
    name: string;
    profileId: string;
    taxReturnId: string;
    userId: string;
    userServiceId: string;
    year?: string;
  },
) {
  return record(id, now, {
    userId: input.userId,
    profileId: input.profileId,
    serviceId: input.userServiceId,
    userServiceId: input.userServiceId,
    taxReturnId: input.taxReturnId,
    fileName: input.fileName,
    originalName: input.fileName,
    name: input.name,
    mimeType: "application/pdf",
    size: 128000,
    originalSize: 128000,
    storedSize: 128000,
    compressionType: "none",
    compressionStatus: "not_applicable",
    category: input.category,
    tags: ["demo", input.category],
    description: "Demo metadata-only document for workspace testing.",
    year: input.year ?? "2026-27",
    status: "active",
    version: 1,
    isDemoMetadataOnly: true,
    downloadUnavailableReason: "Demo document has no Blob file until real document storage is configured.",
  });
}

export function buildDemoWorkspaceSeed(now = new Date()): DemoWorkspaceSeed {
  const clients = [
    {
      id: "temporary_test_user",
      firstName: "Asha",
      lastName: "Iyer",
      email: "test.user@myeca.in",
      profileId: "demo-profile-asha",
      serviceId: "demo-service-asha-itr",
      returnId: "demo-return-asha-2026",
    },
    {
      id: "demo-client-rohan",
      firstName: "Rohan",
      lastName: "Shah",
      email: "demo.rohan.shah@example.test",
      profileId: "demo-profile-rohan",
      serviceId: "demo-service-rohan-gst",
      returnId: "demo-return-rohan-2026",
    },
    {
      id: "demo-client-meera",
      firstName: "Meera",
      lastName: "Nair",
      email: "demo.meera.nair@example.test",
      profileId: "demo-profile-meera",
      serviceId: "demo-service-meera-tax-planning",
      returnId: "demo-return-meera-2026",
    },
  ];

  const users = [
    record(DEMO_ADMIN.id, now, {
      email: DEMO_ADMIN.email,
      firstName: "Demo",
      lastName: "Admin",
      role: "admin",
      status: "active",
      isVerified: true,
    }),
    record(DEMO_CA.id, now, {
      email: DEMO_CA.email,
      firstName: "Demo",
      lastName: "CA",
      role: "ca",
      status: "active",
      isVerified: true,
    }),
    ...clients.map((client) =>
      record(client.id, now, {
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        role: "user",
        status: "active",
        isVerified: true,
        ...assignedCaFields(),
      }),
    ),
  ];

  const profiles = clients.map((client) =>
    record(client.profileId, now, {
      userId: client.id,
      name: `${client.firstName} ${client.lastName}`,
      relation: "self",
      pan: null,
      aadhaar: null,
      dateOfBirth: "1990-04-10",
      address: "Demo address for workspace testing",
      isActive: true,
    }),
  );

  const tax_returns = [
    record("demo-return-asha-2026", now, {
      userId: "temporary_test_user",
      profileId: "demo-profile-asha",
      userServiceId: "demo-service-asha-itr",
      assessmentYear: "2026-27",
      filingPath: "ca",
      recommendedForm: "ITR-1",
      status: "ca_review",
      documentChecklist: [
        { id: "form16", label: "Form 16", status: "uploaded" },
        { id: "ais", label: "AIS/TIS", status: "uploaded" },
      ],
    }),
    record("demo-return-rohan-2026", now, {
      userId: "demo-client-rohan",
      profileId: "demo-profile-rohan",
      userServiceId: "demo-service-rohan-gst",
      assessmentYear: "2026-27",
      filingPath: "ca",
      recommendedForm: "ITR-3",
      status: "draft",
      documentChecklist: [
        { id: "business-books", label: "Business books", status: "pending" },
      ],
    }),
    record("demo-return-meera-2026", now, {
      userId: "demo-client-meera",
      profileId: "demo-profile-meera",
      userServiceId: "demo-service-meera-tax-planning",
      assessmentYear: "2026-27",
      filingPath: "ca",
      recommendedForm: "ITR-2",
      status: "filed",
      documentChecklist: [
        { id: "capital-gains", label: "Capital gains statement", status: "uploaded" },
      ],
    }),
  ];

  const user_services = [
    record("demo-service-asha-itr", now, {
      userId: "temporary_test_user",
      serviceId: "itr-filing",
      serviceTitle: "AY 2026-27 CA ITR Filing Review",
      serviceCategory: "Income Tax",
      profileId: "demo-profile-asha",
      paymentAmount: 2499,
      paymentStatus: "link_requested",
      status: "ca_review",
      ...assignedCaFields(),
      metadata: {
        source: "demo_workspace_seed",
        linkedTaxReturnId: "demo-return-asha-2026",
        recommendedForm: "ITR-1",
        nextAction: "CA review pending",
        ...assignedCaMetadata(),
      },
    }),
    record("demo-service-rohan-gst", now, {
      userId: "demo-client-rohan",
      serviceId: "gst-returns",
      serviceTitle: "GST Return Catch-up",
      serviceCategory: "GST",
      profileId: "demo-profile-rohan",
      paymentAmount: 3999,
      paymentStatus: "pending",
      status: "pending",
      ...assignedCaFields(),
      metadata: {
        source: "demo_workspace_seed",
        linkedTaxReturnId: "demo-return-rohan-2026",
        nextAction: "Upload sales register",
        ...assignedCaMetadata(),
      },
    }),
    record("demo-service-rohan-notice", now, {
      userId: "demo-client-rohan",
      serviceId: "notice-compliance",
      serviceTitle: "Income Tax Notice Response",
      serviceCategory: "Notice",
      profileId: "demo-profile-rohan",
      paymentAmount: 5999,
      paymentStatus: "link_sent",
      status: "in_progress",
      ...assignedCaFields(),
      metadata: {
        source: "demo_workspace_seed",
        nextAction: "Draft response review",
        ...assignedCaMetadata(),
      },
    }),
    record("demo-service-meera-tax-planning", now, {
      userId: "demo-client-meera",
      serviceId: "tax-planning",
      serviceTitle: "Capital Gains Tax Planning",
      serviceCategory: "Advisory",
      profileId: "demo-profile-meera",
      paymentAmount: 7999,
      paymentStatus: "paid",
      status: "completed",
      ...assignedCaFields(),
      metadata: {
        source: "demo_workspace_seed",
        linkedTaxReturnId: "demo-return-meera-2026",
        nextAction: "Archive advisory notes",
        ...assignedCaMetadata(),
      },
    }),
  ];

  const documents = [
    demoDocument("demo-doc-asha-form16", now, {
      userId: "temporary_test_user",
      profileId: "demo-profile-asha",
      userServiceId: "demo-service-asha-itr",
      taxReturnId: "demo-return-asha-2026",
      fileName: "demo-asha-form-16.pdf",
      name: "Form 16 - Demo",
      category: "form16",
    }),
    demoDocument("demo-doc-asha-ais", now, {
      userId: "temporary_test_user",
      profileId: "demo-profile-asha",
      userServiceId: "demo-service-asha-itr",
      taxReturnId: "demo-return-asha-2026",
      fileName: "demo-asha-ais.pdf",
      name: "AIS/TIS Statement - Demo",
      category: "ais",
    }),
    demoDocument("demo-doc-rohan-gst-sales", now, {
      userId: "demo-client-rohan",
      profileId: "demo-profile-rohan",
      userServiceId: "demo-service-rohan-gst",
      taxReturnId: "demo-return-rohan-2026",
      fileName: "demo-rohan-sales-register.pdf",
      name: "Sales Register - Demo",
      category: "gst",
    }),
    demoDocument("demo-doc-meera-capital-gains", now, {
      userId: "demo-client-meera",
      profileId: "demo-profile-meera",
      userServiceId: "demo-service-meera-tax-planning",
      taxReturnId: "demo-return-meera-2026",
      fileName: "demo-meera-capital-gains.pdf",
      name: "Capital Gains Statement - Demo",
      category: "capital-gains",
    }),
    demoDocument("demo-doc-meera-bank", now, {
      userId: "demo-client-meera",
      profileId: "demo-profile-meera",
      userServiceId: "demo-service-meera-tax-planning",
      taxReturnId: "demo-return-meera-2026",
      fileName: "demo-meera-bank-interest.pdf",
      name: "Bank Interest Certificate - Demo",
      category: "bank",
    }),
  ];

  const consultation_requests = [
    record("demo-consult-asha-itr", now, {
      name: "Asha Iyer",
      phone: "9999990001",
      email: "test.user@myeca.in",
      company: null,
      service: "CA ITR Filing Review",
      preferredTime: "Tomorrow morning",
      message: "Demo callback request for reviewing an ITR filing workflow.",
      source: "demo_workspace_seed",
      userId: "temporary_test_user",
      status: "new",
    }),
    record("demo-consult-rohan-gst", now, {
      name: "Rohan Shah",
      phone: "9999990002",
      email: "demo.rohan.shah@example.test",
      company: "Rohan Demo Traders",
      service: "GST Returns",
      preferredTime: "Evening",
      message: "Demo callback request for GST return catch-up.",
      source: "demo_workspace_seed",
      userId: "demo-client-rohan",
      status: "contacted",
      internalNote: "Demo note: requested purchase register.",
    }),
  ];

  const payment_link_requests = [
    record("demo-payment-asha-itr", now, {
      userId: "temporary_test_user",
      userServiceId: "demo-service-asha-itr",
      serviceTitle: "AY 2026-27 CA ITR Filing Review",
      paymentAmount: 2499,
      status: "requested",
      note: "Demo user requested a secure payment link.",
    }),
    record("demo-payment-rohan-notice", now, {
      userId: "demo-client-rohan",
      userServiceId: "demo-service-rohan-notice",
      serviceTitle: "Income Tax Notice Response",
      paymentAmount: 5999,
      status: "link_sent",
      adminNote: "Demo link sent for testing admin update flow.",
      paymentLink: "https://pay.example.test/demo-rohan-notice",
    }),
  ];

  const notifications = [
    record("demo-notification-ca-new-case", now, {
      userId: DEMO_CA.id,
      title: "New demo ITR case",
      message: "Asha Iyer submitted a demo ITR filing review.",
      type: "info",
      read: false,
      metadata: { userServiceId: "demo-service-asha-itr" },
    }),
    record("demo-notification-asha-payment", now, {
      userId: "temporary_test_user",
      title: "Demo payment link requested",
      message: "The team will share a secure payment link after review.",
      type: "info",
      read: false,
      metadata: { userServiceId: "demo-service-asha-itr" },
    }),
    record("demo-notification-rohan-docs", now, {
      userId: "demo-client-rohan",
      title: "Demo documents pending",
      message: "Upload the purchase register to continue the GST workflow.",
      type: "warning",
      read: false,
      metadata: { userServiceId: "demo-service-rohan-gst" },
    }),
  ];

  return {
    users,
    profiles,
    user_services,
    tax_returns,
    documents,
    consultation_requests,
    payment_link_requests,
    notifications,
  };
}

export function summarizeDemoWorkspaceSeed(seed: DemoWorkspaceSeed) {
  return Object.fromEntries(
    DEMO_WORKSPACE_COLLECTIONS.map((collection) => [collection, seed[collection].length]),
  ) as Record<DemoWorkspaceCollection, number>;
}

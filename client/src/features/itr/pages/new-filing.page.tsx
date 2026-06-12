import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  PlusCircle,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MyeCard } from "@/components/platform/compliance-ui";
import { Layout } from "@/components/admin/Layout";
import { useAuth } from "@/components/AuthProvider";
import { CaAssistStrip } from "@/features/itr/components/CaAssistStrip";
import { findOpenDraftFor, type HubOwnerSelection, type HubTaxReturn } from "@/features/itr/lib/hub-selectors";
import { clearItrStartHandoff, readItrStartHandoff } from "@/features/itr/lib/start-selector";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { captureTelemetryEvent } from "@/telemetry/browser";
import { cn } from "@/lib/utils";

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const ASSESSMENT_YEARS = [
  { id: "2026-27", label: "AY 2026-27", helper: "FY 2025-26" },
  { id: "2025-26", label: "AY 2025-26", helper: "Prior year" },
] as const;

const MEMBER_RELATIONS = [
  "spouse",
  "father",
  "mother",
  "son",
  "daughter",
  "brother",
  "sister",
  "other",
] as const;

type MemberProfile = {
  id: string;
  name: string;
  relation?: string | null;
  pan?: string | null;
  isActive?: boolean;
};

type TaxReturnsResponse = { taxReturns: HubTaxReturn[] };

function relationLabel(relation?: string | null) {
  const value = String(relation ?? "").trim();
  if (!value) return "Member";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function panDisplay(pan?: string | null) {
  const value = String(pan ?? "").trim();
  return value ? `PAN ${value}` : "PAN not added";
}

function apiErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Please try again. If it still fails, contact support.";
}

function OwnerCard({
  selected,
  title,
  subtitle,
  detail,
  badge,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  detail: string;
  badge?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition",
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50",
      )}
    >
      <span className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            selected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700",
          )}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-950">{title}</span>
            {badge ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-800">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="mt-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{subtitle}</span>
          <span className="mt-1 block text-sm font-semibold text-slate-600">{detail}</span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-transparent",
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

export default function ITRNewFilingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [assessmentYear, setAssessmentYear] = useState<string>("2026-27");
  const [selection, setSelection] = useState<HubOwnerSelection>({ mode: "self" });
  const [addOpen, setAddOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberRelation, setMemberRelation] = useState<string>("spouse");
  const [memberPan, setMemberPan] = useState("");
  const [memberDob, setMemberDob] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(() => readItrStartHandoff());
  const viewTrackedRef = useRef(false);

  const profilesQuery = useQuery<MemberProfile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await apiRequest("/api/profiles");
      const data = await response.json();
      return Array.isArray(data) ? data : data.profiles || [];
    },
  });

  const taxReturnsQuery = useQuery<TaxReturnsResponse>({
    queryKey: ["/api/tax-returns"],
    queryFn: async () => {
      const response = await apiRequest("/api/tax-returns");
      return response.json();
    },
  });

  const profiles = profilesQuery.data ?? [];
  const taxReturns = taxReturnsQuery.data?.taxReturns ?? [];
  const selfProfile = profiles.find(
    (profile) => String(profile.relation ?? "").toLowerCase() === "self" && profile.isActive !== false,
  );
  const memberProfiles = useMemo(
    () => profiles.filter(
      (profile) => String(profile.relation ?? "").toLowerCase() !== "self" && profile.isActive !== false,
    ),
    [profiles],
  );

  useEffect(() => {
    if (viewTrackedRef.current || profilesQuery.isLoading) return;
    viewTrackedRef.current = true;
    captureTelemetryEvent("itr_owner_screen_viewed", {
      memberCount: memberProfiles.length,
      membersWithPan: memberProfiles.filter((profile) => String(profile.pan ?? "").trim()).length,
    });
  }, [memberProfiles, profilesQuery.isLoading]);

  const openDraftFor = (candidate: HubOwnerSelection) =>
    findOpenDraftFor(taxReturns, candidate, assessmentYear);

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      const name = memberName.trim();
      if (!name) throw new Error("Enter the member's name.");
      const pan = memberPan.trim().toUpperCase();
      if (pan && !PAN_PATTERN.test(pan)) {
        throw new Error("PAN must look like ABCDE1234F.");
      }
      const response = await apiRequest("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          name,
          relation: memberRelation,
          pan,
          dateOfBirth: memberDob,
        }),
      });
      return response.json() as Promise<MemberProfile>;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      captureTelemetryEvent("itr_member_added", { hasPan: Boolean(String(profile.pan ?? "").trim()) });
      if (profile?.id) setSelection({ mode: "member", profileId: profile.id });
      setAddOpen(false);
      setMemberName("");
      setMemberPan("");
      setMemberDob("");
      setMemberError(null);
    },
    onError: (error) => setMemberError(apiErrorMessage(error)),
  });

  const continueMutation = useMutation({
    mutationFn: async () => {
      const existing = openDraftFor(selection);
      if (existing) {
        return { returnId: existing.id, resumed: true };
      }

      const response = await apiRequest("/api/tax-returns", {
        method: "POST",
        body: JSON.stringify({
          assessmentYear,
          owner: selection.mode === "member" ? "member" : "self",
          ...(selection.mode === "member" ? { profileId: selection.profileId } : {}),
          ...(handoff?.draft ? { draft: handoff.draft } : {}),
          ...(handoff?.attribution ? { attribution: handoff.attribution } : {}),
        }),
      });
      const data = await response.json() as { taxReturn?: { id?: string }; resumed?: boolean };
      if (!data.taxReturn?.id) throw new Error("Could not start the filing draft.");
      return { returnId: data.taxReturn.id, resumed: Boolean(data.resumed) };
    },
    onSuccess: ({ returnId, resumed }) => {
      if (handoff) {
        clearItrStartHandoff();
        setHandoff(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/tax-returns"] });
      captureTelemetryEvent(resumed ? "itr_draft_resumed" : "itr_draft_created", {
        ownerMode: selection.mode,
        assessmentYear,
      });
      navigate(`/itr/filing/${returnId}`);
    },
  });

  const selectedOpenDraft = openDraftFor(selection);
  const selfName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Your account";

  const selectOwner = (candidate: HubOwnerSelection, hasPan: boolean) => {
    setSelection(candidate);
    captureTelemetryEvent("itr_owner_selected", {
      mode: candidate.mode,
      hasPan,
      resumed: Boolean(openDraftFor(candidate)),
    });
  };

  return (
    <Layout title="MY ITR">
      <div className="mx-auto max-w-3xl space-y-5 pb-36 md:pb-12">
        <MyeCard className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">New filing</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
            Who are we filing for?
          </h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Choose yourself or a saved family member. Saved details prefill the draft.
          </p>

          <div className="mt-5">
            <p className="text-sm font-black text-slate-950">Assessment year</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ASSESSMENT_YEARS.map((year) => (
                <button
                  key={year.id}
                  type="button"
                  aria-pressed={assessmentYear === year.id}
                  onClick={() => setAssessmentYear(year.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left",
                    assessmentYear === year.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300",
                  )}
                >
                  <span className="block text-sm font-black text-slate-950">{year.label}</span>
                  <span className="block text-xs font-semibold text-slate-600">{year.helper}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <OwnerCard
              selected={selection.mode === "self"}
              title={selfName}
              subtitle="Your account"
              detail={selfProfile ? panDisplay(selfProfile.pan) : user?.email || "PAN can be added during filing"}
              badge={openDraftFor({ mode: "self" }) ? "Draft in progress" : undefined}
              icon={<UserRound className="h-5 w-5" />}
              onClick={() => selectOwner({ mode: "self" }, Boolean(selfProfile?.pan))}
            />

            {profilesQuery.isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading saved members...
              </div>
            ) : null}

            {profilesQuery.isError ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900" role="alert">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-black">We couldn't load saved members</p>
                  <p className="mt-1 leading-6">{apiErrorMessage(profilesQuery.error)} You can still file for yourself.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2 border-amber-300 bg-white font-black text-amber-900 hover:bg-amber-100"
                    onClick={() => void profilesQuery.refetch()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            {memberProfiles.map((profile) => (
              <OwnerCard
                key={profile.id}
                selected={selection.mode === "member" && selection.profileId === profile.id}
                title={profile.name}
                subtitle={relationLabel(profile.relation)}
                detail={panDisplay(profile.pan)}
                badge={openDraftFor({ mode: "member", profileId: profile.id }) ? "Draft in progress" : undefined}
                icon={<UsersRound className="h-5 w-5" />}
                onClick={() => selectOwner({ mode: "member", profileId: profile.id }, Boolean(String(profile.pan ?? "").trim()))}
              />
            ))}

            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <PlusCircle className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-black text-slate-950">Add a family member</span>
                <span className="mt-1 block text-sm font-semibold text-slate-600">
                  Save their name, relation, and PAN once; reuse every year.
                </span>
              </span>
            </button>
          </div>

          {handoff ? (
            <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold leading-6 text-slate-700">
              Your saved form-selector answers will be applied to this new draft.
            </div>
          ) : null}

          {selectedOpenDraft ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">
              A draft for this person and AY {assessmentYear} already exists. Continue resumes that draft.
            </div>
          ) : null}

          {continueMutation.isError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-black text-red-900">We couldn't start this filing</p>
                  <p className="mt-1 leading-6">{apiErrorMessage(continueMutation.error)}</p>
                </div>
              </div>
            </div>
          ) : null}

          <CaAssistStrip variant="inline" className="mt-5" assignedCaName={user?.assignedCaName} />
        </MyeCard>
      </div>

      <div className="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[60] flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_-35px_rgba(15,23,42,0.6)] backdrop-blur md:sticky md:bottom-4 md:mx-auto md:max-w-3xl">
        <Link href="/itr/filing">
          <Button
            type="button"
            variant="outline"
            className="h-11 border-slate-200 bg-white font-black text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <Button
          type="button"
          onClick={() => continueMutation.mutate()}
          disabled={continueMutation.isPending || taxReturnsQuery.isLoading}
          className="h-11 flex-1 bg-blue-600 font-black text-white hover:bg-blue-700 md:max-w-xs"
        >
          {continueMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {selectedOpenDraft ? "Continue draft" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setMemberError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a family member</DialogTitle>
            <DialogDescription>
              Saved members appear here with their PAN for every future filing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-name">Full name</Label>
              <Input
                id="member-name"
                value={memberName}
                autoComplete="name"
                maxLength={100}
                onChange={(event) => setMemberName(event.target.value)}
                className="mt-2 h-11"
              />
            </div>
            <div>
              <Label>Relation</Label>
              <Select value={memberRelation} onValueChange={setMemberRelation}>
                <SelectTrigger className="mt-2 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_RELATIONS.map((relation) => (
                    <SelectItem key={relation} value={relation}>{relationLabel(relation)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="member-pan">PAN (optional)</Label>
              <Input
                id="member-pan"
                value={memberPan}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
                onChange={(event) => setMemberPan(event.target.value.toUpperCase())}
                className="mt-2 h-11 uppercase"
              />
            </div>
            <div>
              <Label htmlFor="member-dob">Date of birth (optional)</Label>
              <Input
                id="member-dob"
                type="date"
                value={memberDob}
                onChange={(event) => setMemberDob(event.target.value)}
                className="mt-2 h-11"
              />
            </div>
            {memberError ? (
              <p className="text-sm font-semibold text-red-700" role="alert">{memberError}</p>
            ) : null}
            <Button
              type="button"
              onClick={() => addMemberMutation.mutate()}
              disabled={addMemberMutation.isPending}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {addMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
              Save member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Database,
  FilePenLine,
  FileText,
  FolderOpen,
  Globe,
  HelpCircle,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  Layers,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import type { AppRole } from "@shared/app-roles";

export type RoleNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export type RoleNavGroup = {
  label: string;
  items: RoleNavItem[];
};

export const ROLE_NAV_GROUPS: Record<AppRole, RoleNavGroup[]> = {
  admin: [
    {
      label: "Management",
      items: [
        { icon: LayoutGrid, label: "Control Center", href: "/admin/dashboard" },
        { icon: Users, label: "Users", href: "/admin/users" },
        { icon: MessageSquare, label: "Requests", href: "/admin/requests" },
        { icon: Layers, label: "Services", href: "/admin/services" },
        { icon: ShieldCheck, label: "CA Review", href: "/admin/requests" },
      ],
    },
    {
      label: "Content",
      items: [
        { icon: FileText, label: "Blog", href: "/admin/blog-management" },
        { icon: ImageIcon, label: "Media", href: "/admin/media-management" },
        { icon: Globe, label: "Categories", href: "/admin/categories-management" },
      ],
    },
    {
      label: "System",
      items: [
        { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
        { icon: Database, label: "Audit Logs", href: "/admin/audit-logs" },
        { icon: Settings, label: "Settings", href: "/admin/settings" },
      ],
    },
  ],
  ca: [
    {
      label: "Practice",
      items: [
        { icon: Briefcase, label: "Dashboard", href: "/ca/dashboard" },
        { icon: Users, label: "Clients", href: "/profiles" },
        { icon: FileText, label: "Reports", href: "/reports" },
      ],
    },
  ],
  team_member: [
    {
      label: "Workspace",
      items: [
        { icon: Home, label: "Team Hub", href: "/team/dashboard" },
      ],
    },
    {
      label: "Operations",
      items: [
        { icon: FileText, label: "Blog", href: "/admin/blog-management" },
        { icon: ImageIcon, label: "Media", href: "/admin/media-management" },
      ],
    },
  ],
  user: [
    {
      label: "Workspace",
      items: [
        { icon: LayoutGrid, label: "Home", href: "/dashboard" },
        { icon: FileText, label: "MY ITR", href: "/itr/filing" },
        { icon: Zap, label: "Services", href: "/dashboard/services" },
        { icon: FolderOpen, label: "Documents", href: "/documents" },
        { icon: FilePenLine, label: "Document Generator", href: "/documents/generator" },
      ],
    },
    {
      label: "Account",
      items: [
        { icon: Settings, label: "Account", href: "/settings" },
        { icon: HelpCircle, label: "Help", href: "/help" },
      ],
    },
  ],
};

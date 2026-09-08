export type WorkspaceRole =
  | "owner"
  | "admin"
  | "member";


export type WorkspaceMember = {
  id: string;
  user_id: string;
  workspace_id: string;
  role: WorkspaceRole;

  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
};


export type Company = {
  id: string;
  workspace_id: string;
  owner_membership_id: string | null;

  name: string;
  domain: string | null;
  website: string | null;
  phone: string | null;
  industry: string | null;

  employee_count: number | null;
  annual_revenue: string | number | null;

  description: string | null;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country: string | null;

  created_at: string;
  updated_at: string;
};


export type Contact = {
  id: string;
  workspace_id: string;

  company_id: string | null;
  owner_membership_id: string | null;

  first_name: string;
  last_name: string | null;

  email: string | null;
  phone: string | null;
  mobile_phone: string | null;

  job_title: string | null;
  department: string | null;
  linkedin_url: string | null;

  description: string | null;

  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country: string | null;

  created_at: string;
  updated_at: string;
};


export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";


export type Deal = {
  id: string;
  workspace_id: string;

  company_id: string | null;
  contact_id: string | null;
  owner_membership_id: string | null;

  name: string;
  amount: string | number | null;
  stage: DealStage;
  probability: number | null;

  expected_close_date: string | null;
  description: string | null;

  created_at: string;
  updated_at: string;
};


export type DealStageHistory = {
  id: string;
  deal_id: string;

  from_stage: DealStage;
  to_stage: DealStage;

  changed_by_membership_id: string;

  created_at: string;
};


export type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "task"
  | "note";


export type Activity = {
  id: string;
  workspace_id: string;

  company_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  owner_membership_id: string | null;

  type: ActivityType;

  subject: string;
  description: string | null;

  due_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
};
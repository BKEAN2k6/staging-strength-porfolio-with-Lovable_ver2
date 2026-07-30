import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EmailTemplateRow = {
  id: string;
  template_key: string;
  name_fi: string;
  name_en: string;
  name_sv: string;
  subject_fi: string;
  subject_en: string;
  subject_sv: string;
  body_fi: string;
  body_en: string;
  body_sv: string;
  description_fi: string | null;
  description_en: string | null;
  description_sv: string | null;
  updated_at: string;
};

async function assertSuperAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

export const listEmailTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EmailTemplateRow[]> => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data, error } = await db
      .from("email_templates")
      .select("*")
      .order("template_key", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as EmailTemplateRow[];
  });

export const saveEmailTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      subject_fi: string;
      subject_en: string;
      subject_sv: string;
      body_fi: string;
      body_en: string;
      body_sv: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { id, ...fields } = data;
    const { error } = await db
      .from("email_templates")
      .update({ ...fields, updated_at: new Date().toISOString(), updated_by: context.userId })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

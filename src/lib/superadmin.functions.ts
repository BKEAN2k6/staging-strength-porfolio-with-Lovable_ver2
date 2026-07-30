import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SchoolRow = {
  id: string;
  name: string;
  code: string;
  language: string;
  is_active: boolean;
  created_at: string;
  billing_start_date: string | null;
  billing_expiry_date: string | null;
  teacherCount: number;
  studentCount: number;
  adminNames: string[];
  codes: string[];
};

export type SchoolUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  joined: string | null;
  lastActive: string | null;
  currentScreen: number | null;
};

export type SchoolCodeRow = {
  id: string;
  code: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
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

async function emailMap(db: any): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const u of data?.users ?? []) map.set(u.id, u.email ?? "");
  return map;
}

function nextCode(existing: string[]): string {
  let max = 0;
  for (const c of existing) {
    const m = /^SCHOOL(\d+)$/.exec(c);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `SCHOOL${String(max + 1).padStart(3, "0")}`;
}

export const listSchools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SchoolRow[]> => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    await db.rpc("check_school_expiry");

    const { data: schools } = await db
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: profiles } = await db.from("profiles").select("id, display_name, school_id");
    const { data: roles } = await db.from("user_roles").select("user_id, role");
    const { data: codes } = await db.from("school_codes").select("school_id, code");

    const roleOf = new Map<string, string>();
    for (const r of roles ?? []) roleOf.set(r.user_id, r.role);

    return (schools ?? []).map((s: any) => {
      const members = (profiles ?? []).filter((p: any) => p.school_id === s.id);
      return {
        ...s,
        teacherCount: members.filter((p: any) => roleOf.get(p.id) === "teacher").length,
        studentCount: members.filter((p: any) => roleOf.get(p.id) === "student").length,
        adminNames: members
          .filter((p: any) => roleOf.get(p.id) === "school_admin")
          .map((p: any) => p.display_name ?? "—"),
        codes: (codes ?? []).filter((c: any) => c.school_id === s.id).map((c: any) => c.code),
      };
    });
  });

export const createSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; language: string; start: string; expiry: string }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data: existing } = await db.from("schools").select("code");
    const code = nextCode(((existing ?? []) as any[]).map((r) => r.code));
    const { data: school, error } = await db
      .from("schools")
      .insert({
        name: data.name.trim(),
        code,
        language: data.language,
        is_active: true,
        billing_start_date: data.start,
        billing_expiry_date: data.expiry || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await db.from("school_codes").insert({
      school_id: school.id,
      code,
      created_by_super_admin_id: context.userId,
    });
    return { code, id: school.id as string };
  });

export const updateSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      id: string;
      name?: string;
      language?: string;
      start?: string;
      expiry?: string;
      isActive?: boolean;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.language !== undefined) patch.language = data.language;
    if (data.start !== undefined) patch.billing_start_date = data.start;
    if (data.expiry !== undefined) patch.billing_expiry_date = data.expiry || null;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    const { error } = await db.from("schools").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renewSchool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; expiry: string }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db
      .from("schools")
      .update({ billing_expiry_date: data.expiry, is_active: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const generateSchoolCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { schoolId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data: existing } = await db.from("school_codes").select("code");
    const { data: schoolCodes } = await db.from("schools").select("code");
    const code = nextCode([
      ...((existing ?? []) as any[]).map((r) => r.code),
      ...((schoolCodes ?? []) as any[]).map((r) => r.code),
    ]);
    const { error } = await db.from("school_codes").insert({
      school_id: data.schoolId,
      code,
      created_by_super_admin_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { code };
  });

export const revokeSchoolCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    await db.from("school_codes").delete().eq("id", data.id);
    return { ok: true };
  });

export const getSchoolDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { schoolId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { data: school } = await db.from("schools").select("*").eq("id", data.schoolId).single();
    const { data: profiles } = await db
      .from("profiles")
      .select("id, display_name, current_screen, created_at, updated_at")
      .eq("school_id", data.schoolId);
    const { data: roles } = await db.from("user_roles").select("user_id, role");
    const { data: codeRows } = await db
      .from("school_codes")
      .select("id, code, is_used, used_by_admin_id, created_at")
      .eq("school_id", data.schoolId)
      .order("created_at", { ascending: false });

    const emails = await emailMap(db);
    const roleOf = new Map<string, string>();
    for (const r of roles ?? []) roleOf.set(r.user_id, r.role);

    // Students who joined through a class code have no school_id on their
    // profile — find them through the classes owned by this school's teachers.
    const allProfiles: any[] = [...((profiles ?? []) as any[])];
    const teacherIds = allProfiles
      .filter((p) => roleOf.get(p.id) === "teacher" || roleOf.get(p.id) === "school_admin")
      .map((p) => p.id);
    if (teacherIds.length) {
      const { data: classes } = await db
        .from("classes")
        .select("id")
        .eq("is_deleted", false)
        .in("teacher_id", teacherIds);
      const classIds = ((classes ?? []) as any[]).map((c) => c.id);
      if (classIds.length) {
        const { data: members } = await db
          .from("class_members")
          .select("student_id")
          .in("class_id", classIds);
        const known = new Set(allProfiles.map((p) => p.id));
        const missing = Array.from(
          new Set(((members ?? []) as any[]).map((m) => m.student_id as string)),
        ).filter((id) => !known.has(id));
        if (missing.length) {
          const { data: extra } = await db
            .from("profiles")
            .select("id, display_name, current_screen, created_at, updated_at")
            .in("id", missing);
          allProfiles.push(...((extra ?? []) as any[]));
        }
      }
    }

    const users: SchoolUser[] = allProfiles.map((p) => ({
      id: p.id,

      name: p.display_name,
      email: emails.get(p.id) ?? null,
      role: roleOf.get(p.id) ?? "student",
      joined: p.created_at,
      lastActive: p.updated_at,
      currentScreen: p.current_screen,
    }));

    const nameOf = new Map(users.map((u) => [u.id, u.name]));
    const codes: SchoolCodeRow[] = ((codeRows ?? []) as any[]).map((c) => ({
      id: c.id,
      code: c.code,
      is_used: c.is_used,
      used_by: c.used_by_admin_id ? (nameOf.get(c.used_by_admin_id) ?? null) : null,
      created_at: c.created_at,
    }));

    const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
    const totalScreens = 106;
    const students = users.filter((u) => u.role === "student");
    return {
      school,
      users,
      codes,
      metrics: {
        teachers: users.filter((u) => u.role === "teacher").length,
        students: students.length,
        admins: users.filter((u) => u.role === "school_admin").length,
        activeThisMonth: users.filter(
          (u) => u.lastActive && new Date(u.lastActive).getTime() > monthAgo,
        ).length,
        avgCompletion: students.length
          ? Math.round(
              (students.reduce((a, s) => a + (s.currentScreen ?? 1), 0) /
                (students.length * totalScreens)) *
                100,
            )
          : 0,
      },
    };
  });

export const updateUserCredentials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; email?: string; password?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const patch: Record<string, unknown> = {};
    if (data.email) patch.email = data.email;
    if (data.password) patch.password = data.password;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await db.auth.admin.updateUserById(data.userId, patch);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: "student" | "teacher" | "school_admin" }) => d)
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const db = await admin();
    const { error } = await db
      .from("user_roles")
      .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

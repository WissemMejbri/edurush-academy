import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "wissemmejbri01@gmail.com";
  const password = "wissem123456789";

  // Check if user exists
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const existing = users?.find(u => u.email === email);

  let userId: string;

  if (existing) {
    // Update password
    await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    userId = existing.id;
  } else {
    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: "Admin", role: "student" } // role overridden below
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    userId = data.user.id;
  }

  // Ensure admin role
  await supabase.from("user_roles").delete().eq("user_id", userId);
  await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });

  // Ensure profile
  await supabase.from("profiles").upsert({ user_id: userId, full_name: "Admin" }, { onConflict: "user_id" });

  return new Response(JSON.stringify({ ok: true, userId }));
});

import { createClient } from "@supabase/supabase-js";

function getArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const NEW_PASSWORD = process.env.NEW_PASSWORD || getArg("password");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || getArg("email");
const ADMIN_USER_ID = process.env.ADMIN_USER_ID || getArg("user-id");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !NEW_PASSWORD) {
  console.error(
    [
      "Missing required values.",
      "",
      "Required:",
      "  SUPABASE_URL",
      "  SUPABASE_SERVICE_ROLE_KEY",
      "  NEW_PASSWORD",
      "",
      "Optional:",
      "  ADMIN_EMAIL",
      "  ADMIN_USER_ID",
      "",
      "You may also pass:",
      "  --email=admin@utpmedtech.club",
      "  --user-id=uuid",
      "  --password=Temp#123456",
    ].join("\n"),
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function findUserId() {
  if (ADMIN_USER_ID) return ADMIN_USER_ID;

  if (ADMIN_EMAIL) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error) throw error;

    const target = data.users.find(
      (user) => (user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    );

    if (!target) {
      throw new Error(`Admin user not found for email: ${ADMIN_EMAIL}`);
    }

    return target.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (error) throw error;
  if (!data?.id) throw new Error("No admin profile found in public.profiles");

  return data.id;
}

async function main() {
  const userId = await findUserId();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: NEW_PASSWORD,
  });

  if (error) throw error;

  console.log(`Password updated successfully for user: ${userId}`);
}

main().catch((error) => {
  console.error("Reset failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});

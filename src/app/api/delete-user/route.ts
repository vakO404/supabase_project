import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

import { supabaseAdmin } from "@/lib/supabaseAdmin"; // must use the SERVICE_ROLE_KEY version

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("Error deleting auth user:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) console.error("Error deleting profile:", profileError.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

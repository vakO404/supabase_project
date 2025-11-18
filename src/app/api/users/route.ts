import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // SERVICE_ROLE_KEY client

export async function GET() {
  try {
    // Fetch all users from profiles table
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, role, full_name, birth_date")
      .order("email", { ascending: true });

    if (error) {
      console.error("Error fetching profiles:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PostsPage from "../posts/page";
export default function dashboard() {

  return (
    PostsPage()
  );
}

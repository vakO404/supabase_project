"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (data) setPosts(data);
    };
    loadPosts();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">All Posts</h1>
      <div className="flex flex-col gap-4 w-97">
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded bg-white shadow text-black">
            <h2 className="text-xl font-semibold text-black">{post.title}</h2>
            <p className="text-black">{post.content}</p>
            {post.image_url && (
              <img 
                src={post.image_url}
                alt={post.title}
                className="mt-2 rounded color-black"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

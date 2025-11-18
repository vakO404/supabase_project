"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("You must be logged in to create a post");
      return;
    }

    let imageUrl: string | null = null;

    // ✅ Handle image upload
    if (file) {
    const uniqueName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("posts-images")
        .upload(`user-${user.id}/${Date.now()}-${uniqueName}`, file);

      if (uploadError) {
        setMessage("Error uploading image: " + uploadError.message);
        return;
      }

      // ✅ Access the URL properly
      const { data: publicUrlData } = supabase.storage
        .from("posts-images")
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrlData.publicUrl;
    }

    // ✅ Insert post into the `posts` table
    const { error: insertError } = await supabase.from("posts").insert({
      user_id: user.id,
      title,
      content,
      image_url: imageUrl,
      created_at: new Date().toISOString(), // optional
    });

    if (insertError) {
      setMessage("Error creating post: " + insertError.message);
    } else {
      setMessage("Post created successfully!");
      setTitle("");
      setContent("");
      setFile(null);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4 text-black">Create New Post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border p-2 rounded text-black"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded text-black"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600"
        >
          Create Post
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

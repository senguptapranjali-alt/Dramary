"use client";

import { supabase } from "@/app/lib/supabase";

export default function TestPage() {

  async function testConnection() {
    const { data, error } = await supabase
      .from("journals")
      .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);
  }

  return (
    <div className="p-10">
      <button
        onClick={testConnection}
        className="bg-pink-500 text-white px-4 py-2 rounded"
      >
        Test Supabase
      </button>
    </div>
  );
}
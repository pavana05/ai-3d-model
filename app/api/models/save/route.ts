import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userId: string

    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString())
      userId = payload.userId
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { name, prompt, modelUrl, quality, format, description } = await request.json()

    if (!name || !prompt || !modelUrl) {
      return NextResponse.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
    }

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    })

    const { data: savedModel, error } = await supabase
      .from("saved_models")
      .insert({
        user_id: userId,
        name,
        prompt,
        model_url: modelUrl,
        quality: quality || "medium",
        format: format || "glb",
        description: description || "",
      })
      .select()
      .single()

    if (error) {
      console.error("Save model error:", error)
      return NextResponse.json({ success: false, error: "Failed to save model" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      model: {
        id: savedModel.id,
        name: savedModel.name,
        prompt: savedModel.prompt,
        modelUrl: savedModel.model_url,
        createdAt: savedModel.created_at,
      },
    })
  } catch (error) {
    console.error("Save model error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

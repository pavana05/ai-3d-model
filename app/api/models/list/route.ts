import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
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

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    })

    const { data: models, error } = await supabase
      .from("saved_models")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("List models error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch models" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      models: (models || []).map((model: any) => ({
        id: model.id,
        name: model.name,
        prompt: model.prompt,
        modelUrl: model.model_url,
        createdAt: model.created_at,
        quality: model.quality,
        format: model.format,
        description: model.description,
      })),
    })
  } catch (error) {
    console.error("List models error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

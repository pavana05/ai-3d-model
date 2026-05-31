import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify the model belongs to the user
    const { data: model, error: fetchError } = await supabase
      .from("saved_models")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError || !model) {
      return NextResponse.json({ success: false, error: "Model not found" }, { status: 404 })
    }

    if (model.user_id !== userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    // Delete the model
    const { error: deleteError } = await supabase.from("saved_models").delete().eq("id", params.id)

    if (deleteError) {
      console.error("Delete model error:", deleteError)
      return NextResponse.json({ success: false, error: "Failed to delete model" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Model deleted successfully",
    })
  } catch (error) {
    console.error("Delete model error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage (replace with database in production)
const savedModels: Array<{
  id: string
  userId: string
  name: string
  prompt: string
  modelUrl: string
  createdAt: string
}> = []

// Simple token verification (replace with JWT in production)
function verifyToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token))
    return payload.userId
  } catch {
    return null
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const userId = verifyToken(token)

    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const modelId = params.id

    // Find the model
    const modelIndex = savedModels.findIndex((model) => model.id === modelId && model.userId === userId)

    if (modelIndex === -1) {
      return NextResponse.json({ success: false, error: "Model not found" }, { status: 404 })
    }

    // Remove the model
    savedModels.splice(modelIndex, 1)

    return NextResponse.json({
      success: true,
      message: "Model deleted successfully",
    })
  } catch (error) {
    console.error("Delete model error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

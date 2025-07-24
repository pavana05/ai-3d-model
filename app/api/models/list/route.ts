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

export async function GET(request: NextRequest) {
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

    // Get user's saved models
    const userModels = savedModels
      .filter((model) => model.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      models: userModels.map((model) => ({
        id: model.id,
        name: model.name,
        prompt: model.prompt,
        modelUrl: model.modelUrl,
        createdAt: model.createdAt,
      })),
    })
  } catch (error) {
    console.error("List models error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

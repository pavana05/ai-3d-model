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

export async function POST(request: NextRequest) {
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

    const { name, prompt, modelUrl } = await request.json()

    // Validation
    if (!name || !prompt || !modelUrl) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Create new saved model
    const modelId = Date.now().toString()
    const newModel = {
      id: modelId,
      userId,
      name,
      prompt,
      modelUrl,
      createdAt: new Date().toISOString(),
    }

    savedModels.push(newModel)

    return NextResponse.json({
      success: true,
      model: {
        id: modelId,
        name,
        prompt,
        modelUrl,
        createdAt: newModel.createdAt,
      },
    })
  } catch (error) {
    console.error("Save model error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

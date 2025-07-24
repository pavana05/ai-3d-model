import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage (replace with database in production)
const users: Array<{
  id: string
  name: string
  email: string
  password: string
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

    const user = users.find((user) => user.id === userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Auth verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

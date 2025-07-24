import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage (replace with database in production)
const users: Array<{
  id: string
  name: string
  email: string
  password: string
}> = []

// Simple hash function (replace with bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

// Simple token generation (replace with JWT in production)
function generateToken(userId: string): string {
  const payload = {
    userId,
    timestamp: Date.now(),
  }
  return btoa(JSON.stringify(payload))
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = users.find((user) => user.email === email)
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const hashedPassword = simpleHash(password)
    if (user.password !== hashedPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Generate token
    const token = generateToken(user.id)

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

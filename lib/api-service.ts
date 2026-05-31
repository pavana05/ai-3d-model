export async function submitRodinJob(formData: FormData) {
  try {
    console.log("[v0] Submitting generation job...")
    const response = await fetch("/api/rodin", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API error response:", errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API response received:", data)
    return data
  } catch (error) {
    console.error("[v0] submitRodinJob error:", error)
    throw error
  }
}

export async function checkJobStatus(subscriptionKey: string) {
  const response = await fetch(`/api/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription_key: subscriptionKey,
    }),
  })

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`)
  }

  return await response.json()
}

export async function downloadModel(taskUuid: string) {
  const response = await fetch(`/api/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_uuid: taskUuid,
    }),
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`)
  }

  return await response.json()
}

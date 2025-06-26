"use client"

import AdvancedLoadingScreen from "./advanced-loading-screen"

interface StatusIndicatorProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
}

export default function StatusIndicator({ isLoading, jobStatuses }: StatusIndicatorProps) {
  return <AdvancedLoadingScreen isLoading={isLoading} jobStatuses={jobStatuses} />
}

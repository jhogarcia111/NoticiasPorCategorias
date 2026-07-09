"use client"

import { useState } from "react"
import { AppFooter } from "./app-footer"
import { VersionModal } from "./version-modal"

export function FooterWrapper() {
  const [showVersion, setShowVersion] = useState(false)

  return (
    <>
      <AppFooter onVersionClick={() => setShowVersion(true)} />
      <VersionModal isOpen={showVersion} onClose={() => setShowVersion(false)} />
    </>
  )
}

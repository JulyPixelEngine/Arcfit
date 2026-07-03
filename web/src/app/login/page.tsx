"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { VStack, HStack } from "@astryxdesign/core/Layout"
import { Grid } from "@astryxdesign/core/Grid"
import { Center } from "@astryxdesign/core/Center"
import { Card } from "@astryxdesign/core/Card"
import { Section } from "@astryxdesign/core/Section"
import { Text } from "@astryxdesign/core/Text"
import { TextInput } from "@astryxdesign/core/TextInput"
import { Selector } from "@astryxdesign/core/Selector"
import { Button } from "@astryxdesign/core/Button"
import { Link as AstryxLink } from "@astryxdesign/core/Link"
import { Divider } from "@astryxdesign/core/Divider"
import api, { saveSession } from "@/lib/api"
import LanguageSwitcher from "@/components/LanguageSwitcher"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"

interface Branch { id: string; name: string }

// ─── Icons ────────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#000"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#333"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#555"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#222"/>
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 1C4.582 1 1 3.91 1 7.5c0 2.302 1.523 4.323 3.826 5.468L3.9 16.3a.25.25 0 0 0 .38.26L8.1 13.94c.296.03.597.06.9.06 4.418 0 8-2.91 8-6.5S13.418 1 9 1Z" fill="#000" />
    </svg>
  )
}

function WeightlifterMark() {
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
        {/* barbell plates + bar */}
        <rect x="1" y="3.2" width="2.4" height="5.6" rx="1" />
        <rect x="20.6" y="3.2" width="2.4" height="5.6" rx="1" />
        <rect x="3" y="5" width="18" height="2" rx="1" />
        {/* head */}
        <circle cx="12" cy="9.6" r="2.1" />
        {/* arms up to bar */}
        <path d="M12 12 8 6.3 9.4 5.4 13 10.6Z" />
        <path d="M12 12 16 6.3 14.6 5.4 11 10.6Z" />
        {/* torso */}
        <rect x="10" y="11.8" width="4" height="3.6" rx="1" />
        {/* squat legs */}
        <path d="M10.2 15.2 6.4 17.8 7.4 19.2 11.2 16.6Z" />
        <path d="M13.8 15.2 17.6 17.8 16.6 19.2 12.8 16.6Z" />
        <path d="M6.8 17.5 5 21.8 6.7 22.3 8.4 18.4Z" />
        <path d="M17.2 17.5 19 21.8 17.3 22.3 15.6 18.4Z" />
      </svg>
    </div>
  )
}

// The container query lives in a plain <style> tag so it needs no CSS compiler.
// Below 511px the grid collapses to a single column; the ambient panel moves
// above the form (order:-1) so the form stays the primary focus on mobile.
const LOGIN_SPLIT_CSS = `
.login-split-grid {
  container-type: inline-size;
  container-name: login-split;
}
.login-split-ambient {
  order: 0;
}
@container login-split (max-width: 511px) {
  .login-split-ambient {
    order: -1;
    min-height: 180px;
  }
}
`

export default function LoginPage() {
  const t = useTranslations("Login")
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [branchId, setBranchId] = useState("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("session") === "expired") setNotice(t("sessionExpired"))
    else if (params.get("registered") === "true") setNotice(t("registered"))

    api.get<Branch[]>("/branches").then((r) => setBranches(r.data)).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogin() {
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/login", { email, password, branch_id: branchId || null })
      saveSession()
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        t("loginFailed")
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <Center axis="both" style={{ minHeight: "100dvh", padding: "var(--spacing-6)" }}>
      <style>{LOGIN_SPLIT_CSS}</style>
      <div style={{ width: "100%", maxWidth: 900 }}>
        <Card padding={0} width="100%" variant="default">
          <Grid
            columns={{ minWidth: 280, repeat: "fit" }}
            gap={0}
            align="stretch"
            className="login-split-grid"
          >
            {/* Form — pale matcha border tint on inputs, scoped to this section only */}
            <Section variant="transparent" padding={6}>
              <VStack
                gap={5}
                style={{ "--color-border": "light-dark(#DCE3CE, #C0CBA91A)" } as React.CSSProperties}
              >
                <HStack gap={2} vAlign="center" justify="between">
                  <HStack gap={2} vAlign="center">
                    <WeightlifterMark />
                    <Text type="body" weight="bold">{t("wordmark")}</Text>
                  </HStack>
                  <LanguageSwitcher />
                </HStack>

                <VStack gap={1}>
                  <Text type="display-1" as="h1">{t("title")}</Text>
                  <Text type="body" color="secondary" size="sm">{t("subtitle")}</Text>
                </VStack>

                {notice && (
                  <Text type="supporting" color="accent">{notice}</Text>
                )}

                <VStack gap={3}>
                  {branches.length > 0 && (
                    <Selector
                      label={t("branch")}
                      value={branchId}
                      onChange={(v) => setBranchId(v)}
                      placeholder={t("selectBranch")}
                      options={branches.map((b) => ({ value: b.id, label: b.name }))}
                      size="lg"
                    />
                  )}

                  <TextInput
                    label={t("email")}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    size="lg"
                  />

                  <TextInput
                    label={t("password")}
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={setPassword}
                    size="lg"
                    status={error ? { type: "error", message: error } : undefined}
                  />
                </VStack>

                <Button
                  label={loading ? t("signingIn") : t("signIn")}
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  onClick={handleLogin}
                />

                <Divider label={t("orContinueWith")} />

                <VStack gap={2}>
                  <Button
                    label="Google"
                    variant="secondary"
                    size="lg"
                    icon={<GoogleIcon />}
                    onClick={() => { window.location.href = `${API_BASE}/auth/google/login` }}
                  />
                  <Button
                    label="Kakao"
                    variant="secondary"
                    size="lg"
                    icon={<KakaoIcon />}
                    onClick={() => { window.location.href = `${API_BASE}/auth/kakao/login` }}
                  />
                </VStack>

                <Text type="supporting" color="secondary">
                  {t("noAccount")}{" "}
                  <AstryxLink href="/signup" type="supporting">
                    {t("createOne")}
                  </AstryxLink>
                </Text>
              </VStack>
            </Section>

            {/* Ambient brand panel */}
            <div className="login-split-ambient">
              <Card variant="transparent" padding={6} width="100%" height="100%">
                <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 320, overflow: "hidden", borderRadius: 10 }}>
                  <Image
                    src="/login-hero.png"
                    alt=""
                    fill
                    sizes="(max-width: 511px) 100vw, 50vw"
                    style={{ objectFit: "cover", borderRadius: 10 }}
                    priority
                  />
                </div>
              </Card>
            </div>
          </Grid>
        </Card>
      </div>
    </Center>
  )
}

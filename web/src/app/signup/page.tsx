"use client"

import { useState, type CSSProperties } from "react"
import { VStack, HStack } from "@astryxdesign/core/Layout"
import { Center } from "@astryxdesign/core/Center"
import { Section } from "@astryxdesign/core/Section"
import { Grid } from "@astryxdesign/core/Grid"
import { AspectRatio } from "@astryxdesign/core/AspectRatio"
import { Button } from "@astryxdesign/core/Button"
import { Text } from "@astryxdesign/core/Text"
import { TextInput } from "@astryxdesign/core/TextInput"
import { TextArea } from "@astryxdesign/core/TextArea"
import { Link } from "@astryxdesign/core/Link"
import { Card } from "@astryxdesign/core/Card"
import api from "@/lib/api"

// AspectRatio has no objectFit/radius prop and there's no Image primitive,
// so the illustration is styled directly. overflow:hidden masks the crop
// to the rounded corners.
const illustrationImg: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "var(--radius-container)",
  overflow: "hidden",
}

export default function SignupPage() {
  const [studioName, setStudioName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [apiError, setApiError] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const errors = submitAttempted
    ? {
        studioName: !studioName.trim() ? "필수 입력입니다" : undefined,
        ownerName: !ownerName.trim() ? "필수 입력입니다" : undefined,
        email: !email.trim() ? "필수 입력입니다" : undefined,
      }
    : {}

  async function handleSubmit() {
    setSubmitAttempted(true)
    setApiError("")
    if (!studioName.trim() || !ownerName.trim() || !email.trim()) return

    setLoading(true)
    try {
      await api.post("/leads", {
        studio_name: studioName,
        owner_name: ownerName,
        email,
        phone: phone || null,
        message: message || null,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(typeof msg === "string" ? msg : "신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center style={{ minHeight: "100vh" }}>
      <Section maxWidth={1100} width="100%" padding={10} variant="transparent">
        <VStack gap={10}>
          <HStack hAlign="center">
            <Text type="label" style={{ letterSpacing: "0.3em", textTransform: "uppercase" }}>
              FitCore
            </Text>
          </HStack>

          {submitted ? (
            <Center>
              <VStack gap={4} hAlign="center" style={{ maxWidth: 420, textAlign: "center" }}>
                <Text type="display-2" as="h1">신청이 접수되었습니다!</Text>
                <Text type="body" color="secondary">
                  담당자가 확인 후 빠르게 연락드리겠습니다. 회원 10명까지는 기간 제한 없이 전 기능을 무료로 이용하실 수 있어요.
                </Text>
                <Link href="/login" type="body" size="sm">로그인 화면으로 돌아가기</Link>
              </VStack>
            </Center>
          ) : (
            <Card padding={0} width="100%" variant="default">
              <Grid columns={{ minWidth: 320, repeat: "fit" }} align="stretch" gap={0}>
                <Section variant="transparent" padding={8}>
                  <VStack gap={6} style={{ height: "100%" }}>
                    <VStack gap={3}>
                      <Text type="display-1" as="h1">우리 센터 무료로 등록하기</Text>
                      <Text type="body" color="secondary">
                        회원 10명까지는 기간 제한 없이 전 기능 무료. 지금 신청하고 편하게 테스트해보세요.
                      </Text>
                    </VStack>
                    <AspectRatio ratio={4 / 3}>
                      <img src="/login-hero.png" alt="" style={illustrationImg} />
                    </AspectRatio>
                  </VStack>
                </Section>

                <Section variant="transparent" padding={8}>
                  <VStack gap={4}>
                    <Text type="label">센터 정보</Text>
                    <TextInput
                      label="센터/스튜디오명"
                      isLabelHidden
                      placeholder="센터/스튜디오명*"
                      value={studioName}
                      onChange={setStudioName}
                      status={errors.studioName ? { type: "error", message: errors.studioName } : undefined}
                    />
                    <TextInput
                      label="원장님 성함"
                      isLabelHidden
                      placeholder="원장님 성함*"
                      value={ownerName}
                      onChange={setOwnerName}
                      status={errors.ownerName ? { type: "error", message: errors.ownerName } : undefined}
                    />
                    <Grid columns={{ minWidth: 180, repeat: "fit" }} gap={3}>
                      <TextInput
                        label="이메일"
                        isLabelHidden
                        placeholder="이메일*"
                        value={email}
                        onChange={setEmail}
                        status={errors.email ? { type: "error", message: errors.email } : undefined}
                      />
                      <TextInput
                        label="연락처"
                        isLabelHidden
                        placeholder="연락처"
                        value={phone}
                        onChange={setPhone}
                      />
                    </Grid>

                    <TextArea
                      label="하고 싶은 말"
                      isLabelHidden
                      placeholder="궁금한 점이나 필요한 기능을 알려주세요 (선택)"
                      value={message}
                      onChange={setMessage}
                    />

                    {apiError && <Text type="supporting" className="text-red-500">{apiError}</Text>}

                    {/* hAlign="stretch" = full-width button workaround */}
                    <VStack hAlign="stretch">
                      <Button
                        label={loading ? "제출 중..." : "무료로 등록 신청하기"}
                        variant="primary"
                        isDisabled={loading}
                        onClick={handleSubmit}
                      />
                    </VStack>

                    <HStack hAlign="center">
                      <Text type="supporting" color="secondary">
                        이미 계정이 있으신가요?{" "}
                        <Link href="/login" type="supporting">로그인</Link>
                      </Text>
                    </HStack>
                  </VStack>
                </Section>
              </Grid>
            </Card>
          )}
        </VStack>
      </Section>
    </Center>
  )
}

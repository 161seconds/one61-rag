import { httpRequest } from "@/libs"
import { ENDPOINT_PATH } from "@/shared/constants"
import type { ApiResponse } from "@/shared/hooks"

type PresignResponse = {
  key: string
  uploadUrl: string
  publicUrl: string
}

async function presignUpload(params: {
  fileName: string
  contentType: string
  folder?: string
}): Promise<PresignResponse> {
  const res = await httpRequest.post<ApiResponse<PresignResponse>>(
    `/${ENDPOINT_PATH.UPLOAD}/presign`,
    params
  )
  return (res as unknown as ApiResponse<PresignResponse>).data
}

async function putFileToUrl(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText}${text ? ` — ${text}` : ""}`
    )
  }
}

export async function uploadFile(file: File, folder?: string): Promise<string> {
  const contentType = file.type || "application/octet-stream"
  const { uploadUrl, publicUrl } = await presignUpload({
    fileName: file.name || "paste.png",
    contentType,
    folder,
  })
  // Ensure the uploaded request uses the same Content-Type as used for presigning.
  const fileWithType = file.type
    ? file
    : new File([file], file.name || "file", { type: contentType })
  await putFileToUrl(uploadUrl, fileWithType)
  return publicUrl
}

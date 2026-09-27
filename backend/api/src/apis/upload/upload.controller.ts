import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common"
import type { JwtAccessToken } from "../../passport/"
import { CurrentUser, JwtAccessTokenGuard } from "../../passport/"
import { ZodValidationPipe } from "../../shared/pipe/"
import type { PresignUploadRequest } from "./upload.schema"
import { presignUploadSchema } from "./upload.schema"
import { UploadService } from "./upload.service"

@Controller("upload")
export class UploadController {
  constructor(
    @Inject(UploadService) private readonly uploadService: UploadService
  ) {}

  @Post("presign")
  @UseGuards(JwtAccessTokenGuard)
  async presign(
    @CurrentUser() user: JwtAccessToken,
    @Body(new ZodValidationPipe(presignUploadSchema))
    body: PresignUploadRequest
  ) {
    return this.uploadService.presignPutObject({
      userId: user.userId,
      ...body,
    })
  }
}

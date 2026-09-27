import { z } from "zod";

export const presignUploadSchema = z.object({
	fileName: z.string().min(1),
	contentType: z.string().min(1),
	folder: z.string().optional(),
});

export type PresignUploadRequest = z.infer<typeof presignUploadSchema>;

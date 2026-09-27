import { Injectable } from "@nestjs/common";
import { envConfig } from "@aqua-calendar/env";
import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type PresignResult = {
	key: string;
	uploadUrl: string;
	publicUrl: string;
};

function stripTrailingSlashes(value: string): string {
	return value.replace(/\/+$/, "");
}

function normalizeFolder(folder: string | undefined): string {
	const value = (folder ?? "uploads").trim();
	const noSlashes = value.replace(/^\/+/, "").replace(/\/+$/, "");
	if (noSlashes === "" || noSlashes === ".") return "uploads";
	if (noSlashes.includes("..")) return "uploads";
	return noSlashes;
}

function sanitizeFileName(fileName: string): string {
	const base = fileName.trim();
	const last = base.split(/[/\\]/).pop() ?? "file";
	const safe = last.replace(/[^\w.-]+/g, "_");
	return safe === "" ? "file" : safe;
}

function sanitizePathSegment(value: string): string {
	const safe = value.trim().replace(/[^\w.-]+/g, "_");
	return safe === "" ? "unknown" : safe;
}

function stripBucketFromEndpoint(endpoint: string, bucket: string): string {
	const clean = stripTrailingSlashes(endpoint);
	const suffix = `/${bucket}`;
	return bucket && clean.endsWith(suffix)
		? clean.slice(0, -suffix.length)
		: clean;
}

function computePublicBaseUrl(endpoint: string, bucket: string): string {
	const clean = stripTrailingSlashes(endpoint);
	if (!bucket) return clean;
	return clean.endsWith(`/${bucket}`) ? clean : `${clean}/${bucket}`;
}

@Injectable()
export class UploadService {
	async presignPutObject(input: {
		userId: string;
		fileName: string;
		contentType: string;
		folder?: string;
	}): Promise<PresignResult> {
		const cfg = envConfig().r2;

		const rawEndpoint = cfg.endpoint;
		const bucket = cfg.bucket;
		const signingEndpoint = stripBucketFromEndpoint(rawEndpoint, bucket);
		const publicBaseUrl =
			cfg.publicBaseUrl ?? computePublicBaseUrl(rawEndpoint, bucket);

		const folder = normalizeFolder(input.folder);
		const safeFileName = sanitizeFileName(input.fileName);
		const safeUserId = sanitizePathSegment(input.userId);
		const key = `${folder}/${safeUserId}/${randomUUID()}-${safeFileName}`;

		const client = new S3Client({
			region: "auto",
			endpoint: signingEndpoint,
			credentials: {
				accessKeyId: cfg.accessKeyId,
				secretAccessKey: cfg.secretAccessKey,
			},
			forcePathStyle: true,
		});

		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			ContentType: input.contentType,
		});

		const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
		const publicUrl = `${stripTrailingSlashes(publicBaseUrl)}/${key}`;

		return { key, uploadUrl, publicUrl };
	}
}

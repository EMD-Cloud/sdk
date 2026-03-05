/**
 * Read permission levels for uploaded files
 * Determines who can access the uploaded file
 * @deprecated Use {@link AccessPolicy} instead for granular v2 access control
 */
export enum ReadPermission {
  /** File is publicly accessible without authentication */
  Public = 'public',
  /** File is accessible only to authenticated users */
  OnlyAuthUser = 'onlyAuthUser',
  /** File is accessible only to app staff members */
  OnlyAppStaff = 'onlyAppStaff',
  /** File is accessible only to specifically permitted users */
  OnlyPermittedUsers = 'onlyPermittedUsers',
  /** File is accessible only to app staff and specifically permitted users */
  OnlyAppStaffAndPermittedUsers = 'onlyAppStaffAndPermittedUsers',
}

/**
 * Base access type for v2 access policy
 */
export enum AccessPolicyType {
  /** File is publicly accessible */
  Public = 'public',
  /** File is accessible only to authenticated users */
  OnlyAuthUser = 'onlyAuthUser',
  /** File is private (accessible only via explicit grants) */
  Private = 'private',
}

/**
 * Content disposition for file downloads
 */
export enum ContentDisposition {
  /** Display the file inline in the browser */
  Inline = 'inline',
  /** Prompt the user to download the file */
  Attachment = 'attachment',
}

/**
 * v2 access policy for uploaded files (mutually exclusive with ReadPermission).
 *
 * - `Public` / `OnlyAuthUser`: no additional grant flags allowed.
 * - `Private`: optionally grant access to staff, the file owner, or permitted users.
 */
export type AccessPolicy =
  | { type: AccessPolicyType.Public }
  | { type: AccessPolicyType.OnlyAuthUser }
  | {
      type: AccessPolicyType.Private
      allowStaff?: boolean
      allowPersonal?: boolean
      allowPermittedUsers?: boolean
    }

/**
 * Upload status tracking
 */
export enum UploadStatus {
  /** Upload has been initialized but not started */
  Pending = 'pending',
  /** Upload is currently in progress */
  Uploading = 'uploading',
  /** Upload completed successfully */
  Success = 'success',
  /** Upload failed */
  Failed = 'failed',
}

/**
 * Configuration options for file upload
 */
export interface UploadOptions {
  /** Integration ID for S3 storage (defaults to 'default') */
  integration?: string
  /** Size of each upload chunk in bytes (default: 5MB) */
  chunkSize?: number
  /** Array of retry delay intervals in milliseconds */
  retryDelays?: number[]
  /**
   * Read permission level for the uploaded file
   * @deprecated Use {@link UploadOptions.accessPolicy} instead for granular v2 access control
   */
  readPermission?: ReadPermission
  /** Array of user IDs who can access the file (required when permission requires permitted users) */
  permittedUsers?: string[]
  /** Time-to-live for presigned URLs in minutes (default: 60) */
  presignedUrlTTL?: number
  /** Additional custom headers to include in upload requests */
  headers?: Record<string, string | number | boolean>
  /** Callback invoked before each HTTP request during upload */
  onBeforeRequest?: (req: any) => void
  /** v2 access policy (mutually exclusive with readPermission) */
  accessPolicy?: AccessPolicy
}

/**
 * Upload progress information
 */
export interface UploadProgress {
  /** Number of bytes uploaded so far */
  bytesUploaded: number
  /** Total number of bytes to upload */
  bytesTotal: number
  /** Upload progress as a percentage (0-100) */
  percentage: number
}

/**
 * Metadata for uploaded file
 */
export interface UploadMetadata {
  /** Name of the file */
  filename: string
  /** MIME type of the file */
  filetype: string
  /**
   * Read permission level (v1)
   * @deprecated Prefer {@link UploadMetadata.access_policy} for v2 access control
   */
  read_permission?: string
  /** v2 access policy as JSON string */
  access_policy?: string
  /** Semicolon-separated list of permitted user IDs */
  permitted_users?: string
  /** Presigned URL TTL in minutes */
  presigned_url_ttl: string
}

/**
 * Callback functions for upload events
 */
export interface UploadCallbacks {
  /** Called when upload progress updates */
  onProgress?: (progress: UploadProgress) => void
  /** Called when upload completes successfully */
  onSuccess?: (fileId: string, fileUrl: string) => void
  /** Called when upload fails */
  onError?: (error: Error) => void
}

/**
 * Represents a file being uploaded with its state and control methods
 */
export interface UploadFile {
  /** Unique identifier for this upload */
  id: string
  /** Name of the file being uploaded */
  fileName: string
  /** Current upload status */
  status: UploadStatus
  /** Current upload progress (if uploading) */
  progress?: UploadProgress
  /** URL to access the uploaded file (available after successful upload) */
  fileUrl?: string
  /** Error that occurred during upload (if failed) */
  error?: Error
  /** Abort the upload */
  abort: () => void
}

/**
 * Response from starting an upload
 */
export interface StartUploadResponse {
  /** Unique identifier for the upload */
  uploadId: string
  /** UploadFile object to track upload state */
  file: UploadFile
}

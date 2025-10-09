import AppOptions from 'src/core/AppOptions'
import { ValidationError } from 'src/errors/ValidationError'
import { Upload } from 'tus-js-client'
import { v4 as uuidv4 } from 'uuid'
import type {
  UploadOptions,
  UploadCallbacks,
  StartUploadResponse,
  UploadFile,
  UploadStatus,
  UploadProgress,
} from 'src/types/uploader'
import { ReadPermission } from 'src/types/uploader'

class Uploader {
  private applicationOptions: AppOptions

  constructor(applicationOptions: AppOptions) {
    this.applicationOptions = applicationOptions
  }

  /**
   * Uploads a file to EMD Cloud storage using chunked upload (TUS protocol).
   *
   * This method initiates a resumable file upload with support for progress tracking,
   * automatic retries, and flexible permission settings. The upload can be paused and
   * resumed even after connection interruptions.
   *
   * @param {File} file - The file to upload (browser File object).
   * @param {UploadOptions} [options] - Configuration options for the upload.
   * @param {string} [options.integration='default'] - S3 integration identifier.
   * @param {number} [options.chunkSize] - Size of each upload chunk in bytes.
   * @param {number[]} [options.retryDelays=[0, 3000, 5000, 10000, 20000]] - Retry delay intervals in milliseconds.
   * @param {ReadPermission} [options.readPermission=ReadPermission.OnlyAppStaff] - Access permission level for the file.
   * @param {string[]} [options.permittedUsers] - Array of user IDs (required when readPermission is OnlyPermittedUsers).
   * @param {number} [options.presignedUrlTTL=60] - Time-to-live for presigned URLs in minutes.
   * @param {Record<string, string|number|boolean>} [options.headers] - Additional HTTP headers.
   * @param {UploadCallbacks} [callbacks] - Event callbacks for upload lifecycle.
   * @param {Function} [callbacks.onProgress] - Called on progress updates.
   * @param {Function} [callbacks.onSuccess] - Called when upload succeeds.
   * @param {Function} [callbacks.onError] - Called when upload fails.
   * @returns {StartUploadResponse} Object containing uploadId and UploadFile for tracking/control.
   * @throws {ValidationError} If required parameters are invalid or missing.
   *
   * @example
   * // Basic file upload
   * const { file } = emdCloud.uploader.uploadFile(myFile, {
   *   readPermission: ReadPermission.OnlyAuthUser
   * }, {
   *   onProgress: (progress) => {
   *     console.log(`Upload progress: ${progress.percentage}%`);
   *   },
   *   onSuccess: (fileId, fileUrl) => {
   *     console.log('File uploaded:', fileUrl);
   *   },
   *   onError: (error) => {
   *     console.error('Upload failed:', error);
   *   }
   * });
   *
   * @example
   * // Upload with specific user permissions
   * const { file } = emdCloud.uploader.uploadFile(document, {
   *   readPermission: ReadPermission.OnlyPermittedUsers,
   *   permittedUsers: ['user-id-1', 'user-id-2']
   * });
   *
   * // Cancel the upload later
   * file.abort();
   */
  uploadFile(
    file: File,
    options: UploadOptions = {},
    callbacks: UploadCallbacks = {},
  ): StartUploadResponse {
    if (!file) {
      throw new ValidationError('File is required')
    }

    const { apiUrl, app } = this.applicationOptions.getOptions()

    const {
      integration = 'default',
      chunkSize = 5 * 1024 * 1024, // Default 5MB chunks
      retryDelays = [0, 3000, 5000, 10000, 20000],
      readPermission = ReadPermission.OnlyAppStaff,
      permittedUsers,
      presignedUrlTTL = 60,
      headers = {},
      onBeforeRequest,
    } = options

    // Validate readPermission and permittedUsers
    if (readPermission === 'onlyPermittedUsers' && !permittedUsers?.length) {
      throw new ValidationError(
        'permittedUsers array is required when readPermission is OnlyPermittedUsers',
      )
    }

    const uploadId = uuidv4()
    const endpoint = `${apiUrl}/api/${app}/uploader/chunk/${integration}/s3/`

    // Get authentication header
    const authenticationHeader =
      this.applicationOptions.getAuthorizationHeader()

    // Build upload metadata
    const metadata: Record<string, string> = {
      filename: file.name,
      filetype: file.type || 'application/octet-stream',
      read_permission: readPermission,
      presigned_url_ttl: presignedUrlTTL.toString(),
    }

    if (permittedUsers?.length) {
      metadata.permitted_users = permittedUsers.join(';')
    }

    // Create UploadFile object to track state
    const uploadFile: UploadFile = {
      id: uploadId,
      fileName: file.name,
      status: 'pending' as UploadStatus,
      abort: () => {
        upload.abort()
      },
    }

    // Convert headers to string values (tus-js-client requires string headers)
    const stringHeaders: Record<string, string> = {}
    Object.entries(headers).forEach(([key, value]) => {
      stringHeaders[key] = String(value)
    })

    // Create TUS upload instance
    const upload = new Upload(file, {
      endpoint,
      chunkSize,
      retryDelays,
      headers: {
        ...authenticationHeader,
        ...stringHeaders,
      },
      metadata,
      ...(onBeforeRequest && { onBeforeRequest }),
      onError: (error: Error) => {
        uploadFile.status = 'failed' as UploadStatus
        uploadFile.error = error
        callbacks.onError?.(error)
      },
      onProgress: (bytesUploaded: number, bytesTotal: number) => {
        const percentage = Number(
          ((bytesUploaded / bytesTotal) * 100).toFixed(2),
        )

        const progress: UploadProgress = {
          bytesUploaded,
          bytesTotal,
          percentage,
        }

        uploadFile.status = 'uploading' as UploadStatus
        uploadFile.progress = progress

        callbacks.onProgress?.(progress)
      },
      onSuccess: (payload) => {
        const lastResponse = payload.lastResponse

        if (lastResponse) {
          const xFileDownloadId = lastResponse.getHeader('X-File-Download-Id')

          if (xFileDownloadId) {
            const fileUrl = this.getFileUrl(integration, xFileDownloadId)

            uploadFile.status = 'success' as UploadStatus
            uploadFile.fileUrl = fileUrl

            callbacks.onSuccess?.(xFileDownloadId, fileUrl)
            return
          }
        }

        // If we couldn't get file ID, mark as failed
        const error = new Error('Failed to retrieve file ID from server')
        uploadFile.status = 'failed' as UploadStatus
        uploadFile.error = error
        callbacks.onError?.(error)
      },
    })

    // Start the upload
    upload.start()

    return {
      uploadId,
      file: uploadFile,
    }
  }

  /**
   * Constructs the URL to access an uploaded file.
   *
   * @param {string} integration - The integration ID used during upload.
   * @param {string} fileId - The file identifier (base64url encoded).
   * @returns {string} The complete URL to access the file.
   *
   * @example
   * const fileUrl = emdCloud.uploader.getFileUrl('default', 'abc123');
   * // Returns: https://api.emd.one/api/myapp/uploader/chunk/default/file/abc123
   */
  getFileUrl(integration: string, fileId: string): string {
    const { apiUrl, app } = this.applicationOptions.getOptions()
    return `${apiUrl}/api/${app}/uploader/chunk/${integration}/file/${fileId}`
  }

  /**
   * Constructs the URL to access file metadata.
   *
   * @param {string} integration - The integration ID used during upload.
   * @param {string} fileId - The file identifier (base64url encoded).
   * @returns {string} The complete URL to access file metadata.
   *
   * @example
   * const metaUrl = emdCloud.uploader.getMetaUrl('default', 'abc123');
   * // Returns: https://api.emd.one/api/myapp/uploader/chunk/default/meta/abc123
   */
  getMetaUrl(integration: string, fileId: string): string {
    const { apiUrl, app } = this.applicationOptions.getOptions()
    return `${apiUrl}/api/${app}/uploader/chunk/${integration}/meta/${fileId}`
  }
}

export { Uploader }

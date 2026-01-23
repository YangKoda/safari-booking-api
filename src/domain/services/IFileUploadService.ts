export interface UploadFileDTO {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  folder: 'tours' | 'users' | 'reviews';
}

export interface UploadedFile {
  key: string;
  url: string;
  size: number;
}

export interface IFileUploadService {
  uploadImage(dto: UploadFileDTO): Promise<UploadedFile>;
  deleteFile(key: string): Promise<void>;
  generateSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

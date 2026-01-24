export interface UploadTourImagesDTO {
  tourId: string;
  files: Express.Multer.File[];
}

export interface IUploadTourImagesUseCase {
  execute(dto: UploadTourImagesDTO): Promise<string[]>;
}

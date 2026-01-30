export interface UploadUserAvatarDTO {
  userId: string;
  file: Express.Multer.File;
}

export interface IUploadUserAvatarUseCase {
  execute(dto: UploadUserAvatarDTO): Promise<string>;
}

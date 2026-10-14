import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import 'multer';
import { MediaService } from './media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload hình ảnh lên Cloudinary',
    description:
      'Nhận file ảnh (jpg, png, webp...), tối đa 5MB và upload lên thư mục detox-drinks trên Cloudinary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh (tối đa 5MB)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Upload thành công, trả về thông tin ảnh và URL trên Cloudinary',
  })
  @ApiResponse({
    status: 400,
    description: 'File không đúng định dạng ảnh hoặc vượt quá dung lượng 5MB',
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/*' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.mediaService.uploadFile(file);
  }
}

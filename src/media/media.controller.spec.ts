import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';

describe('MediaController', () => {
  let controller: MediaController;
  let service: MediaService;

  // 1. Đối tượng giả lập MediaService (Mock)
  const mockMediaService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    // 2. Tạo Module kiểm thử độc lập
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService, // Thay thế MediaService thật bằng Mock
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('phải gọi mediaService.uploadFile và trả về kết quả upload', async () => {
      // Giả lập file đầu vào từ Multer
      const mockFile = {
        originalname: 'detox-green.png',
        mimetype: 'image/png',
        size: 1024,
        buffer: Buffer.from('fake-image-binary'),
      } as Express.Multer.File;

      // Giả lập kết quả trả về từ Cloudinary
      const expectedResult = {
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        public_id: 'detox-drinks/sample',
      };

      // Định nghĩa hành vi cho mock: khi uploadFile được gọi, trả về expectedResult
      mockMediaService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(mockFile);

      // Kiểm tra hàm của service đã được gọi đúng 1 lần với đúng file đó
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile);
      // Kiểm tra kết quả trả về khớp với mong đợi
      expect(result).toEqual(expectedResult);
    });
  });
});

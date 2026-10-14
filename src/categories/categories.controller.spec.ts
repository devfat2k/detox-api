import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './create-category.dto.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  // 1. Mock CategoriesService với đầy đủ 3 hàm nghiệp vụ
  const mockCategoriesService = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    // 2. Tạo Sandbox Testing Module cô lập
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService, // Thay thế service thật bằng mock
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Xóa lịch sử gọi hàm sau mỗi bài test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('phải trả về danh sách toàn bộ danh mục từ service', async () => {
      const mockResult = [
        { id: '1', name: 'Sinh tố xanh', slug: 'sinh-to-xanh' },
        { id: '2', name: 'Nước ép tươi', slug: 'nuoc-ep-tuoi' },
      ];

      mockCategoriesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findBySlug', () => {
    it('phải gọi service.findBySlug với đúng slug và trả về chi tiết danh mục', async () => {
      const mockSlug = 'sinh-to-xanh';
      const mockCategory = {
        id: '1',
        name: 'Sinh tố xanh',
        slug: mockSlug,
        description: 'Dồi dào diệp lục',
      };

      mockCategoriesService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug(mockSlug);

      expect(service.findBySlug).toHaveBeenCalledWith(mockSlug);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('create', () => {
    it('phải chuyển tiếp DTO tới service.create và trả về danh mục vừa tạo', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Sữa hạt dinh dưỡng',
        slug: 'sua-hat-dinh-duong',
        description: 'Cung cấp chất béo lành tính',
      };

      const createdResult = {
        id: '3',
        ...createDto,
        created_at: new Date().toISOString(),
      };

      mockCategoriesService.create.mockResolvedValue(createdResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdResult);
    });
  });
});

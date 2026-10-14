/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { DrinksController } from './drinks.controller';
import { DrinksService } from './drinks.service';

describe('DrinksController', () => {
  let controller: DrinksController;

  const mockDrink = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    slug: 'sinh-to-xanh-healthy',
    name: 'Sinh Tố Xanh Healthy',
    category_id: 'smoothie_green',
    price: 39000,
    ingredients: ['Cải bó xôi', 'Cải kale'],
    benefit: 'Bổ sung chất xơ hòa tan',
    color: 'green',
    level: 85,
    is_detox_core: true,
    target_goals: ['digestion', 'weight'],
  };

  const mockDrinksService = {
    findAll: jest.fn().mockResolvedValue([mockDrink]),
    findBySlug: jest.fn().mockResolvedValue(mockDrink),
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'new-id', ...dto })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinksController],
      providers: [
        {
          provide: DrinksService,
          useValue: mockDrinksService,
        },
      ],
    }).compile();

    controller = module.get<DrinksController>(DrinksController);
  });

  it('nên được khởi tạo thành công', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('nên trả về danh sách thức uống', async () => {
      const result = await controller.findAll({});
      expect(result).toHaveLength(1);
      expect(mockDrinksService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findBySlug', () => {
    it('nên trả về chi tiết thức uống theo slug', async () => {
      const result = await controller.findBySlug('sinh-to-xanh-healthy');
      expect(result).toHaveProperty('slug', 'sinh-to-xanh-healthy');
      expect(mockDrinksService.findBySlug).toHaveBeenCalledWith('sinh-to-xanh-healthy');
    });
  });
});

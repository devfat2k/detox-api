import { Test, TestingModule } from '@nestjs/testing';
import { PlansController } from './plans.controller.js';
import { PlansService } from './plans.service.js';

describe('PlansController', () => {
  let controller: PlansController;
  let service: PlansService;

  const mockPlans = [
    {
      id: 'plan-1',
      name: 'Gói Khởi Động 1 Ngày',
      slug: 'goi-khoi-dong-1-ngay',
      duration_days: 1,
      total_bottles: 5,
    },
    {
      id: 'plan-2',
      name: 'Gói Cân Bằng 3 Ngày',
      slug: 'goi-can-bang-3-ngay',
      duration_days: 3,
      total_bottles: 15,
    },
  ];

  const mockPlansService = {
    findAll: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlansController],
      providers: [
        {
          provide: PlansService,
          useValue: mockPlansService,
        },
      ],
    }).compile();

    controller = module.get<PlansController>(PlansController);
    service = module.get<PlansService>(PlansService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of all detox plans', async () => {
      mockPlansService.findAll.mockResolvedValue(mockPlans);

      const result = await controller.findAll();

      expect(result).toEqual(mockPlans);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findBySlug', () => {
    it('should return a plan matching the provided slug', async () => {
      const targetSlug = 'goi-can-bang-3-ngay';
      const expectedPlan = mockPlans[1];

      mockPlansService.findBySlug.mockResolvedValue(expectedPlan);

      const result = await controller.findBySlug(targetSlug);

      expect(result).toEqual(expectedPlan);
      expect(service.findBySlug).toHaveBeenCalledWith(targetSlug);
      expect(service.findBySlug).toHaveBeenCalledTimes(1);
    });
  });
});

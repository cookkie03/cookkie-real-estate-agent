/**
 * Matching Service Tests
 *
 * Unit tests for property-client matching service.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { ZoneScorer } from '../../domain/algorithms/zone-scorer';
import { BudgetScorer } from '../../domain/algorithms/budget-scorer';
import { TypeScorer } from '../../domain/algorithms/type-scorer';
import { SurfaceScorer } from '../../domain/algorithms/surface-scorer';
import { AvailabilityScorer } from '../../domain/algorithms/availability-scorer';
import { PriorityScorer } from '../../domain/algorithms/priority-scorer';
import { AffinityScorer } from '../../domain/algorithms/affinity-scorer';

describe('MatchingService', () => {
  let service: MatchingService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    property: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    request: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    match: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        ZoneScorer,
        BudgetScorer,
        TypeScorer,
        SurfaceScorer,
        AvailabilityScorer,
        PriorityScorer,
        AffinityScorer,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateMatch', () => {
    it('should calculate match score correctly', async () => {
      const request = {
        id: 'req_1',
        contractType: 'sale',
        searchCities: ['Milano'],
        propertyTypes: ['apartment'],
        priceMin: 200000,
        priceMax: 300000,
        sqmMin: 60,
        sqmMax: 100,
        roomsMin: 2,
      };

      const property = {
        id: 'prop_1',
        contractType: 'sale',
        city: 'Milano',
        zone: 'Centro',
        propertyType: 'apartment',
        priceSale: 250000,
        sqmCommercial: 80,
        rooms: 3,
        status: 'available',
        latitude: 45.464,
        longitude: 9.19,
      };

      const match = await service.calculateMatch(request as any, property as any);

      expect(match).toBeDefined();
      expect(match.scoreTotal).toBeGreaterThan(0);
      expect(match.scoreTotal).toBeLessThanOrEqual(100);
      expect(match.scoreLocation).toBeDefined();
      expect(match.scorePrice).toBeDefined();
      expect(match.scoreSize).toBeDefined();
    });

    it('should give high score for perfect match', async () => {
      const request = {
        id: 'req_1',
        contractType: 'sale',
        searchCities: ['Milano'],
        searchZones: ['Centro'],
        propertyTypes: ['apartment'],
        priceMin: 240000,
        priceMax: 260000,
        sqmMin: 75,
        sqmMax: 85,
        roomsMin: 3,
        roomsMax: 3,
      };

      const property = {
        id: 'prop_1',
        contractType: 'sale',
        city: 'Milano',
        zone: 'Centro',
        propertyType: 'apartment',
        priceSale: 250000,
        sqmCommercial: 80,
        rooms: 3,
        status: 'available',
        latitude: 45.464,
        longitude: 9.19,
      };

      const match = await service.calculateMatch(request as any, property as any);

      expect(match.scoreTotal).toBeGreaterThan(90);
    });

    it('should give low score for poor match', async () => {
      const request = {
        id: 'req_1',
        contractType: 'rent',
        searchCities: ['Roma'],
        propertyTypes: ['villa'],
        priceMin: 1000,
        priceMax: 1500,
        sqmMin: 150,
      };

      const property = {
        id: 'prop_1',
        contractType: 'sale',
        city: 'Milano',
        propertyType: 'apartment',
        priceSale: 500000,
        sqmCommercial: 60,
        rooms: 2,
        status: 'available',
        latitude: 45.464,
        longitude: 9.19,
      };

      const match = await service.calculateMatch(request as any, property as any);

      expect(match.scoreTotal).toBeLessThan(40);
    });
  });

  describe('findMatchesForRequest', () => {
    it('should find and rank matches for a request', async () => {
      const request = {
        id: 'req_1',
        contractType: 'sale',
        searchCities: ['Milano'],
        propertyTypes: ['apartment'],
        priceMin: 200000,
        priceMax: 300000,
      };

      const properties = [
        {
          id: 'prop_1',
          contractType: 'sale',
          city: 'Milano',
          propertyType: 'apartment',
          priceSale: 250000,
          status: 'available',
        },
        {
          id: 'prop_2',
          contractType: 'sale',
          city: 'Milano',
          propertyType: 'apartment',
          priceSale: 280000,
          status: 'available',
        },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(properties);
      mockPrismaService.match.create.mockImplementation((data) =>
        Promise.resolve({ id: 'match_1', ...data.data }),
      );

      const matches = await service.findMatchesForRequest(request as any, {
        limit: 10,
        minScore: 50,
      });

      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBe(true);
      expect(mockPrismaService.property.findMany).toHaveBeenCalled();
    });

    it('should filter matches by minimum score', async () => {
      const request = {
        id: 'req_1',
        contractType: 'sale',
        searchCities: ['Milano'],
      };

      const properties = [
        {
          id: 'prop_1',
          contractType: 'sale',
          city: 'Milano',
          status: 'available',
        },
      ];

      mockPrismaService.property.findMany.mockResolvedValue(properties);

      const matches = await service.findMatchesForRequest(request as any, {
        minScore: 80,
      });

      expect(matches.every((m) => m.scoreTotal >= 80)).toBe(true);
    });
  });

  describe('getMatchStatistics', () => {
    it('should calculate match statistics', async () => {
      mockPrismaService.match.findMany.mockResolvedValue([
        { scoreTotal: 85, status: 'suggested' },
        { scoreTotal: 90, status: 'sent' },
        { scoreTotal: 75, status: 'rejected' },
      ]);

      const stats = await service.getMatchStatistics('req_1');

      expect(stats).toBeDefined();
      expect(stats.totalMatches).toBe(3);
      expect(stats.averageScore).toBeCloseTo(83.33, 1);
    });
  });
});

import { jest } from '@jest/globals';

const mockService = {
  create: jest.fn(),
  getAll: jest.fn()
};

jest.unstable_mockModule('../../src/services/restaurants.service.js', () => ({
  RestaurantsService: jest.fn(() => mockService)
}));

const { crear, listar } = await import('../../src/controllers/restaurants.controller.js');

function mockReqRes(body = {}) {
  return {
    req: { body },
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  };
}

describe('Restaurants Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  test('crear → 201', async () => {
    mockService.create.mockResolvedValue(true);

    const { req, res } = mockReqRes({
      nombre: 'Restaurante'
    });

    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('crear → 400', async () => {
    const { req, res } = mockReqRes({});
    await crear(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('listar → 200', async () => {
    mockService.getAll.mockResolvedValue([]);

    const { req, res } = mockReqRes();
    await listar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});
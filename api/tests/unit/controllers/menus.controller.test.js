import { jest } from '@jest/globals';

const mockService = {
  create: jest.fn()
};

jest.unstable_mockModule('../../src/services/menus.service.js', () => ({
  MenusService: jest.fn(() => mockService)
}));

const { crear } = await import('../../src/controllers/menus.controller.js');

function mockReqRes(body = {}) {
  return {
    req: { body },
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  };
}

describe('Menus Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  test('crear → 201', async () => {
    mockService.create.mockResolvedValue(true);

    const { req, res } = mockReqRes({
      nombre: 'Menu',
      id_restaurante: 1
    });

    await crear(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('crear → 400', async () => {
    const { req, res } = mockReqRes({});
    await crear(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

});
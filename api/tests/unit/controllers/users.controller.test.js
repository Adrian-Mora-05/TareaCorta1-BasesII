import { jest } from '@jest/globals';

const mockUserService = {
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

jest.unstable_mockModule('../../src/services/users.service.js', () => ({
  UsersService: jest.fn(() => mockUserService)
}));

const { getMe, update, remove } = await import('../../src/controllers/users.controller.js');

function mockReqRes(body = {}, params = {}, auth = {}) {
  return {
    req: { body, params, auth },
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  };
}

describe('Users Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  test('getMe → 200', async () => {
    mockUserService.getById.mockResolvedValue({ id: 1 });

    const { req, res } = mockReqRes({}, {}, { sub: 'uuid' });

    await getMe(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getMe → 404', async () => {
    mockUserService.getById.mockResolvedValue(null);

    const { req, res } = mockReqRes({}, {}, { sub: 'uuid' });

    await getMe(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('update → 200', async () => {
    mockUserService.update.mockResolvedValue(true);

    const { req, res } = mockReqRes(
      { nombre: 'Nuevo', correo: 'a@a.com' },
      { id: '1' }
    );

    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('update → 400', async () => {
    const { req, res } = mockReqRes({}, { id: '1' });

    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('remove → 200', async () => {
    mockUserService.delete.mockResolvedValue(true);

    const { req, res } = mockReqRes({}, { id: '1' });

    await remove(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

});
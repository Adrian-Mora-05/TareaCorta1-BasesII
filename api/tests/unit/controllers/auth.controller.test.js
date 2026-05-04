import { jest } from '@jest/globals';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn()
};

jest.unstable_mockModule('../../src/services/auth.service.js', () => ({
  AuthService: jest.fn(() => mockAuthService)
}));

const { register, login } = await import('../../src/controllers/auth.controller.js');

function mockReqRes(body = {}, auth = null) {
  return {
    req: { body, auth },
    res: {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  };
}

describe('Auth Controller', () => {

  beforeEach(() => jest.clearAllMocks());

  test('register → 201', async () => {
    mockAuthService.register.mockResolvedValue(true);

    const { req, res } = mockReqRes({
      username: 'test',
      email: 'test@test.com',
      password: '123'
    });

    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('register → 400', async () => {
    const { req, res } = mockReqRes({});
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('login → 200', async () => {
    mockAuthService.login.mockResolvedValue({ access_token: 'token' });

    const { req, res } = mockReqRes({
      username: 'test',
      password: '123'
    });

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('login → 401', async () => {
    mockAuthService.login.mockRejectedValue(new Error());

    const { req, res } = mockReqRes({
      username: 'bad',
      password: 'bad'
    });

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

});
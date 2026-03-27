import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';

jest.unstable_mockModule('../../src/middlewares/auth.js', () => ({
  checkJwt: (req, res, next) => { req.auth = { sub: 'integ-test-uuid', roles: ['admin'] }; next(); },
  optionalJwt: (req, res, next) => { req.auth = null; next(); }
}));

const { default: app } = await import('../../src/app.js');
const { default: request } = await import('supertest');
const { query } = await import('../../src/config/db.js');

describe('Menus Integration', () => {

  let restauranteId;
  let menuId;

  beforeAll(async () => {
    const res = await query(
      `INSERT INTO restaurant.restaurante (nombre, direccion, telefono)
       VALUES ('Rest Menus Test', 'Dir Test', '0000') RETURNING id`
    );
    restauranteId = res.rows[0].id;
  });

  afterAll(async () => {
    await query(`DELETE FROM restaurant.menu WHERE id_restaurante = $1`, [restauranteId]);
    await query(`DELETE FROM restaurant.restaurante WHERE id = $1`, [restauranteId]);
  });

  test('POST /menus - 201 crea menú', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', 'Bearer fake-token')
      .send({ nombre: 'Menú Integración', id_restaurante: restauranteId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    menuId = res.body.id;
  });

  test('POST /menus - 400 faltan campos', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', 'Bearer fake-token')
      .send({ nombre: 'Sin restaurante' });
    expect(res.status).toBe(400);
  });

  test('GET /menus/:id - 200 menú encontrado', async () => {
    const res = await request(app)
      .get(`/menus/${menuId}`)
      .set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('nombre', 'Menú Integración');
  });

  test('GET /menus/:id - 404 menú no existe', async () => {
    const res = await request(app)
      .get('/menus/99999')
      .set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(404);
  });

  test('PUT /menus/:id - 200 actualiza menú', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', 'Bearer fake-token')
      .send({ nombre: 'Menú Actualizado' });
    expect(res.status).toBe(200);
  });

  test('DELETE /menus/:id - 200 elimina menú', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', 'Bearer fake-token');
    expect(res.status).toBe(200);
  });
});
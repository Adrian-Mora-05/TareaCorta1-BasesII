import { initApp } from './app.js';

const PORT = process.env.PORT || 3000;

const app = await initApp(); // 

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
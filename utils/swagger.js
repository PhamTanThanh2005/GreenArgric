import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const swaggerPath = path.resolve('./config/swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));

export const setupSwagger = (app) => {
  const options = {
    swaggerOptions: {
      persistAuthorization: true, 
    },
    customCss: '.swagger-ui .topbar { display: none }'
  };

  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
  
  console.log('Swagger UI tại: http://localhost:3000/api');
};
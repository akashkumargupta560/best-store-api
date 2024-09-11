const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors, and no-cache)
server.use(middlewares);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public', 'images')); // Correct path
  },
  filename: function (req, file, cb) {
    let date = new Date();
    let imageFilename = date.getTime() + "_" + file.originalname;
    req.body.imageFilename = imageFilename; // Store filename in request body
    cb(null, imageFilename); // Save file with unique name
  }
});

const upload = multer({ storage: storage });

// Middleware for parsing multipart/form-data
server.use(upload.any());

// Custom route to handle POST requests with validation
server.post('/products', (req, res, next) => {
  let date = new Date();
  req.body.createAt = date.toISOString();

  if (req.body.price) {
    req.body.price = Number(req.body.price);
  }

  let hasErrors = false;
  let errors = {};

  if (!req.body.name || req.body.name.length < 2) {
    hasErrors = true;
    errors.name = "The name length should be at least 2 characters!";
  }
  if (!req.body.brand || req.body.brand.length < 2) {
    hasErrors = true;
    errors.brand = "The brand length should be at least 2 characters!";
  }
  if (!req.body.category || req.body.category.length < 2) {
    hasErrors = true;
    errors.category = "The category length should be at least 2 characters!";
  }
  if (!req.body.price || req.body.price <= 0) {
    hasErrors = true;
    errors.price = "The price is not valid!";
  }
  if (!req.body.description || req.body.description.length < 10) {
    hasErrors = true;
    errors.description = "The description length should be at least 10 characters!";
  }

  if (hasErrors) {
    // Return bad request (400) with validation errors
    return res.status(400).jsonp(errors);
  }

  // Continue to JSON Server router
  next();
});

// Use default router
server.use(router);

// Start the server
server.listen(8000, () => {
  console.log('JSON Server is running on http://localhost:8000');
});

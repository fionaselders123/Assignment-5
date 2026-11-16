// Import packages, initialize an express app, and define the port you will use



// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here

// Parse JSON bodies
app.use(express.json());

// Custom middleware #1: request logging (applied to all routes)
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  // Log request body for POST and PUT requests
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }

  next(); 
};

app.use(requestLogger);

// Inputs validation rules for POST and PUT)
const menuItemValidation = [
  body('name')
    .isString().withMessage('Name must be a string')
    .bail()
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),

  body('description')
    .isString().withMessage('Description must be a string')
    .bail()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),

  body('price')
    .custom(value => typeof value === 'number' && value > 0)
    .withMessage('Price must be a number greater than 0'),

  body('category')
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be one of: appetizer, entree, dessert, beverage'),

  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('Ingredients must be an array with at least one ingredient'),

  body('available')
    .optional()
    .custom(value => typeof value === 'boolean')
    .withMessage('Available must be true or false')
];

// Checks validation results, returns a 400 if failed
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      messages: errors.array().map(error => error.msg)
    });
  }

  // Default value for available, if not provided
  if (req.body.available === undefined) {
    req.body.available = true;
  }

  next();
};

// Routes

// Gets all menu items
app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

// Gets one menu item by ID
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = menuItems.find(menuItem => menuItem.id === id);

  if (!item) {
    return res.status(404).json({ error: `Menu item with ID ${req.params.id} not found` });
  }

  res.status(200).json(item);
});

// Posts a new menu item
app.post('/api/menu', menuItemValidation, handleValidationErrors, (req, res) => {
  const { name, description, price, category, ingredients, available } = req.body;

  const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
  const newItem = { id: newId, name, description, price, category, ingredients, available };

  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// Puts an existing menu item
app.put('/api/menu/:id', menuItemValidation, handleValidationErrors, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = menuItems.findIndex(menuItem => menuItem.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Menu item with ID ${req.params.id} not found` });
  }

  const { name, description, price, category, ingredients, available } = req.body;
  menuItems[index] = { id, name, description, price, category, ingredients, available };

  res.status(200).json(menuItems[index]);
});

// Deletes a menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = menuItems.findIndex(menuItem => menuItem.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Menu item with ID ${req.params.id} not found` });
  }

  const [deletedItem] = menuItems.splice(index, 1);
  res.status(200).json({ message: 'Menu item deleted', item: deletedItem });
});

// Returns a 400 and not a server error
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Validation failed', messages: ['Request body must be valid JSON'] });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

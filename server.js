const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/product');
const multer = require('multer');
const path = require('path');

// Create an Express app
const app = express();

// Allow cross-origin requests (needed to connect frontend and backend)
// Update CORS to allow requests only from your Netlify frontend
app.use(cors({
    origin:  ['http://localhost:3000', 'rad-marshmallow-f281f7.netlify.app'],
    credentials: true // Replace with your actual Netlify frontend URL
}));

// Allow our server to understand JSON data
app.use(express.json());

// Make the uploads folder public to serve the images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB (our database)
mongoose.connect('mongodb+srv://gopijagarlamudi99:Gopichand99$@cluster0.ok0qn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.log('Failed to connect to MongoDB:', error));

// Set up a simple route to test our server
app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Create a folder called "uploads" where images will be saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Assign a unique filename to each uploaded image
    }
});

// Set up Multer with the storage configuration
const upload = multer({ storage: storage });

// Route to add a new product (with image upload)
app.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price } = req.body;

        // Check if all fields are provided
        if (!name || !description || !price || !req.file) {
            return res.status(400).send({ error: "All fields (name, description, price, image) are required." });
        }

        const imageUrl = `/uploads/${req.file.filename}`; // Get the file path for the image

        // Create a new product with the given information
        const newProduct = new Product({
            name,
            description,
            price,
            imageUrl
        });

        // Save the new product in the database
        await newProduct.save();

        // Send a response back with the new product data
        res.status(201).send(newProduct);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Route to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Route to delete a product by ID
app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start the server on port 5000
app.listen(5000, () => {
    console.log('Backend running on port 5000');
});

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import cors from 'cors'
dotenv.config();
app.use(cors());
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));

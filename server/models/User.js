import mongoose from 'mongoose';
import Repo from './Repo.js';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('findOneAndDelete', async function(next) {
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    await Repo.deleteMany({ owner: user._id });
  }
  next();
});

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'users',
    versionKey: false,
    bufferCommands: false,
  }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);


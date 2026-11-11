import mongoose from 'mongoose';

const revokedTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    collection: 'revoked_tokens',
    versionKey: false,
    bufferCommands: false,
  }
);

export const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);


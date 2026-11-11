import mongoose from 'mongoose';

const designSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    templateId: {
      type: String,
      required: true,
      enum: ['template-1', 'template-2', 'template-3'],
    },
    status: {
      type: String,
      enum: ['draft', 'completed'],
      default: 'draft',
    },
    createdAt: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: String,
      required: true,
      index: true,
    },
    thumbnail: {
      type: String,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    canvasJson: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    collection: 'designs',
    minimize: false,
    versionKey: false,
    bufferCommands: false,
  }
);

designSchema.index({ userId: 1, id: 1 }, { unique: true });

designSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export const Design = mongoose.model('Design', designSchema);

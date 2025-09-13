import mongoose, { Schema, Document } from 'mongoose';

// 文件元数据接口
export interface IFileMetadata extends Document {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  extension: string;
  hash: string;
  relativePath: string;
  absolutePath: string;
  publicUrl: string;
  uploadedAt: Date;
  userId?: string;
  category: string;
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'failed' | 'deleted';
  metadata: {
    exif?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    colorProfile?: string;
    hasTransparency?: boolean;
  };
  versions: Array<{
    type: 'thumbnail' | 'compressed' | 'watermarked' | 'styled';
    fileName: string;
    publicUrl: string;
    fileSize: number;
    dimensions?: {
      width: number;
      height: number;
    };
    createdAt: Date;
  }>;
  accessCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 文件元数据Schema
const FileMetadataSchema = new Schema<IFileMetadata>({
  originalName: {
    type: String,
    required: true,
    trim: true,
  },
  fileName: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0,
  },
  fileType: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  extension: {
    type: String,
    required: true,
    lowercase: true,
  },
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  relativePath: {
    type: String,
    required: true,
  },
  absolutePath: {
    type: String,
    required: true,
  },
  publicUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    index: true,
  },
  category: {
    type: String,
    required: true,
    default: 'uploads',
    enum: ['uploads', 'processed', 'original', 'thumbnails', 'temp'],
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  dimensions: {
    width: Number,
    height: Number,
  },
  status: {
    type: String,
    required: true,
    default: 'uploaded',
    enum: ['uploading', 'uploaded', 'processing', 'processed', 'failed', 'deleted'],
    index: true,
  },
  metadata: {
    exif: Schema.Types.Mixed,
    colorProfile: String,
    hasTransparency: Boolean,
  },
  versions: [{
    type: {
      type: String,
      required: true,
      enum: ['thumbnail', 'compressed', 'watermarked', 'styled'],
    },
    fileName: {
      type: String,
      required: true,
    },
    publicUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    dimensions: {
      width: Number,
      height: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccessedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// 索引
FileMetadataSchema.index({ userId: 1, category: 1 });
FileMetadataSchema.index({ hash: 1 });
FileMetadataSchema.index({ createdAt: -1 });
FileMetadataSchema.index({ fileSize: 1 });
FileMetadataSchema.index({ tags: 1 });

// 虚拟字段
FileMetadataSchema.virtual('sizeInMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

FileMetadataSchema.virtual('isImage').get(function() {
  return this.mimeType.startsWith('image/');
});

// 中间件
FileMetadataSchema.pre('save', function(next) {
  if (this.isNew) {
    this.uploadedAt = new Date();
  }
  next();
});

// 静态方法
FileMetadataSchema.statics.findByHash = function(hash: string) {
  return this.findOne({ hash });
};

FileMetadataSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

FileMetadataSchema.statics.findByCategory = function(category: string) {
  return this.find({ category }).sort({ createdAt: -1 });
};

FileMetadataSchema.statics.getStorageStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        avgSize: { $avg: '$fileSize' },
        maxSize: { $max: '$fileSize' },
        minSize: { $min: '$fileSize' },
      }
    }
  ]);

  const byCategory = await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
      }
    }
  ]);

  const byType = await this.aggregate([
    {
      $group: {
        _id: '$extension',
        count: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
      }
    }
  ]);

  return {
    overall: stats[0] || { totalFiles: 0, totalSize: 0, avgSize: 0, maxSize: 0, minSize: 0 },
    byCategory: byCategory.reduce((acc, item) => {
      acc[item._id] = { count: item.count, totalSize: item.totalSize };
      return acc;
    }, {}),
    byType: byType.reduce((acc, item) => {
      acc[item._id] = { count: item.count, totalSize: item.totalSize };
      return acc;
    }, {}),
  };
};

// 实例方法
FileMetadataSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

FileMetadataSchema.methods.addVersion = function(versionData: {
  type: string;
  fileName: string;
  publicUrl: string;
  fileSize: number;
  dimensions?: { width: number; height: number };
}) {
  this.versions.push({
    ...versionData,
    createdAt: new Date(),
  });
  return this.save();
};

FileMetadataSchema.methods.updateStatus = function(status: string) {
  this.status = status;
  return this.save();
};

// 导出模型
export const FileMetadata = mongoose.models.FileMetadata || mongoose.model<IFileMetadata>('FileMetadata', FileMetadataSchema);

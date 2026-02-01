import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  entityType: string; // 'Transaction', 'Invoice', 'Expense', etc.
  entityId: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete';
  field?: string;
  oldValue?: any;
  newValue?: any;
  changedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    field: {
      type: String,
      trim: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
    },
    newValue: {
      type: Schema.Types.Mixed,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use custom timestamp field
  }
);

// Indexes for efficient querying
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ changedBy: 1 });
AuditLogSchema.index({ timestamp: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;








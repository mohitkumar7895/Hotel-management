import connectDB from '@/lib/mongodb';
import AuditLog from '@/lib/models/AuditLog';
import mongoose from 'mongoose';

export async function logAudit(
  entityType: string,
  entityId: mongoose.Types.ObjectId | string,
  action: 'create' | 'update' | 'delete',
  changedBy: mongoose.Types.ObjectId | string,
  field?: string,
  oldValue?: any,
  newValue?: any
): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      entityType,
      entityId: typeof entityId === 'string' ? new mongoose.Types.ObjectId(entityId) : entityId,
      action,
      field,
      oldValue,
      newValue,
      changedBy: typeof changedBy === 'string' ? new mongoose.Types.ObjectId(changedBy) : changedBy,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
    // Don't throw - audit logging should not break the main flow
  }
}




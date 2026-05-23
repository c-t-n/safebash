import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScriptVersionDocument = ScriptVersion & Document;

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ScriptVersion {
  @Prop({ type: Types.ObjectId, ref: 'Script', required: true })
  scriptId: Types.ObjectId;

  @Prop({ required: true })
  versionNumber: number;

  @Prop({ required: true })
  content: string;

  // Stored as a plain object; typed via AnalysisResult in services
  @Prop({ type: Object })
  analysis?: Record<string, unknown>;

  /** Lifecycle of the analysis job for this version. Versions are persisted
   *  with `pending`; the worker flips it to `processing` while running and to
   *  `completed` / `failed` when done. */
  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  analysisStatus: AnalysisStatus;

  /** Error message captured when analysisStatus === 'failed'. */
  @Prop({ type: String })
  analysisError?: string;

  createdAt?: Date;
}

export const ScriptVersionSchema = SchemaFactory.createForClass(ScriptVersion);
ScriptVersionSchema.index({ scriptId: 1, versionNumber: 1 }, { unique: true });

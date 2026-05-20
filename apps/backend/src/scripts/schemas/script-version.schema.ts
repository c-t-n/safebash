import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScriptVersionDocument = ScriptVersion & Document;

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

  createdAt?: Date;
}

export const ScriptVersionSchema = SchemaFactory.createForClass(ScriptVersion);
ScriptVersionSchema.index({ scriptId: 1, versionNumber: 1 }, { unique: true });

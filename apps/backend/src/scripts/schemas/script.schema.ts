import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScriptDocument = Script & Document;

@Schema({ timestamps: true })
export class Script {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  url?: string;

  @Prop({ default: 0 })
  currentVersionNumber: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ScriptSchema = SchemaFactory.createForClass(Script);

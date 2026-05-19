import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ScriptDocument = Script & Document;

@Schema({ timestamps: true })
export class Script {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  description?: string;

  @Prop()
  url?: string;

  @Prop()
  trustScore?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ScriptSchema = SchemaFactory.createForClass(Script);

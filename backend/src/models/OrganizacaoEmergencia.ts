import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrganizacaoEmergencia extends Document {
  user_id: Types.ObjectId;
  organization_id: Types.ObjectId;
}

const OrganizacaoEmergenciaSchema = new Schema<IOrganizacaoEmergencia>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: 'Organizacao', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IOrganizacaoEmergencia>('OrganizacaoEmergencia', OrganizacaoEmergenciaSchema);

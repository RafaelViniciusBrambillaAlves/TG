import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrganizacaoUsuario extends Document {
  user_id: Types.ObjectId;
  organization_id: Types.ObjectId;
}

const OrganizacaoUsuarioSchema = new Schema<IOrganizacaoUsuario>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    organization_id: { type: Schema.Types.ObjectId, ref: 'Organizacao', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IOrganizacaoUsuario>('OrganizacaoUsuario', OrganizacaoUsuarioSchema);

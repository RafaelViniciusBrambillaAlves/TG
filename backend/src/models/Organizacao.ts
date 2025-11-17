import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizacao extends Document {
  name: string;
  phone?: string;
  email?: string;
  website?: string;
  short?: string
  description?: string
  logo?: string
}

const OrganizacaoSchema = new Schema<IOrganizacao>(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    short: String,
    description: String,
    logo: String,
    website: String,
  },
  { timestamps: true }
);
OrganizacaoSchema.virtual("centros", {
  ref: "Centro",
  localField: "_id",
  foreignField: "orgId",
  justOne: false,
});
OrganizacaoSchema.virtual("emergencias", {
  ref: "Emergencia",
  localField: "_id",
  foreignField: "orgId",
  justOne: false,
});
export default mongoose.model<IOrganizacao>('Organizacao', OrganizacaoSchema);

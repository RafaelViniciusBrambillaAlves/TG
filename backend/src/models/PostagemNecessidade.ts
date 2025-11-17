import mongoose, { Schema, Document } from 'mongoose';

export interface IPostagemNecessidade extends Document {
  id_mensagem?: mongoose.Types.ObjectId;
  id_necessidade?: mongoose.Types.ObjectId;
}

const PostagemNecessidadeSchema = new Schema<IPostagemNecessidade>(
  {
    id_mensagem: { type: Schema.Types.ObjectId, ref: 'PostagemDemanda' },
    id_necessidade: { type: Schema.Types.ObjectId, ref: 'Necessidade' }
  },
  { timestamps: true }
);

export default mongoose.model<IPostagemNecessidade>('PostagemNecessidade', PostagemNecessidadeSchema);

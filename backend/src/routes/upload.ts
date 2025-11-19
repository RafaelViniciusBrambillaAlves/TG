import express from "express";
import multer from "multer";
import { Readable } from "stream";
import { ObjectId } from "mongodb";
import { getBucket } from "../db/connectMongoDB";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v1/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Arquivo ausente" });

    const bucket = getBucket();

    const filename = req.file.originalname;
    const contentType = req.file.mimetype;
    const buffer = req.file.buffer;

    const readable = Readable.from(buffer);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
    });

    readable.pipe(uploadStream)
      .on("error", (err) => {
        console.error("Erro upload GridFS:", err);
        res.status(500).json({ message: "Erro ao salvar arquivo" });
      })
      .on("finish", () => {
        const fileId = uploadStream.id; 
        const url = `/api/v1/files/${fileId.toString()}`;
        res.json({ fileId: fileId.toString(), url });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erro interno" });
  }
});

// GET /api/v1/files/:id  -> faz stream do GridFS
router.get("/files/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send("id inválido");
    const bucket = getBucket();
    const _id = new ObjectId(id);

    const downloadStream = bucket.openDownloadStream(_id);

    downloadStream.on("error", (err) => {
      console.error("Erro download stream:", err);
      res.status(404).end();
    });

    // opcional: tentar buscar metadados para contentType
    // Mas GridFS já guarda contentType se definido no upload
    // set headers se souber o contentType:
    // res.setHeader("Content-Type", "image/jpeg");

    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("erro servidor");
  }
});

export default router;

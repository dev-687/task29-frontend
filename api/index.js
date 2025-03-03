import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

/** Store video in memory (Vercel does not support file storage) */
app.post("/api/uploads", upload.single("video"), async (req, res) => {
    console.log("React");

    if (!req.file) {
        return res.status(400).send("No file found..");
    }

    // 🔹 Instead of saving locally, upload to cloud storage (e.g., S3, Cloudinary)
    const videoUrl = `https://task29-frontend.vercel.app/${req.file.originalname}`;

    res.json({ videoUrl });
});

/** Stream video (If using an external storage like S3, adjust this route) */
app.get("/video/:filename", (req, res) => {
    const videoPath = path.join(process.cwd(), "uploads", req.params.filename);

    if (!fs.existsSync(videoPath)) {
        return res.status(400).send("Video Not Found");
    }

    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range;

    if (!range) {
        return res.status(416).send("Requires Range header");
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB chunk
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

// Export for Vercel serverless deployment
export default app;

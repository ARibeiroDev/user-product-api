import Router, { type Request, type Response } from "express";
import path from "path";
import { getDirName } from "../utils/pathHelper.js";

const __dirname = getDirName(import.meta.url);

export const router = Router();

router.get(["/", "/index{.html}"], (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

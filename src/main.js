import { Express } from "express";
import { Morgan } from "morgan";

const app = new Express();
app.use(Morgan("dev"));
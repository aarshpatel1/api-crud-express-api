import express from "express";

import * as facultiesController from "../../../controllers/api/v1/facultiesController.js";

const router = express.Router();

router.post("/register", facultiesController.register);

router.post("/login", facultiesController.login);

export default router;

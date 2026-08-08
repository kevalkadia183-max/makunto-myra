import { Router, type IRouter } from "express";
import healthRouter from "./health";
import voxRouter from "./vox";
import socialRouter from "./social";

const router: IRouter = Router();

router.use(healthRouter);
router.use(voxRouter);
router.use(socialRouter);

export default router;

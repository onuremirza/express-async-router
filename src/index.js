const express = require("express");
const AsyncRouter = require("./asyncRouter");
const app = express();
AsyncRouter.implementAsyncRouter({ express });

const syncHandler = (req, res) => {
  throw new Error("Sync route handler error");
};

const asyncHandler = async (req, res) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("Async route handler error"));
    }, 1000);
  });
};

const customRouter = express.AsyncRouter();
const normalRouter = express.Router();

customRouter.get("/sync", syncHandler);
customRouter.get("/async", asyncHandler);

normalRouter.get("/sync", syncHandler);
normalRouter.get("/async", asyncHandler);

app.use("/api/custom", customRouter);
app.use("/api/normal", normalRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

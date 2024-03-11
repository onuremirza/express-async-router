const { METHODS: methods } = require("http");

class AsyncRouter {
  constructor({ express, asyncRouteHandler }) {
    if (asyncRouteHandler) this.asyncRouteHandler = asyncRouteHandler;
    else this.asyncRouteHandler = this.__asyncRouteHandlerDefaultImpl;

    this.express = express;
    this.express.AsyncRouter = this.__createAsyncRouter.bind(this);
  }

  __asyncRouteHandlerDefaultImpl(fn) {
    return (...args) => {
      const fnReturn = fn(...args);
      const next = this.__getNextFunctionFromHandlerArguments(args);

      return Promise.resolve(fnReturn).catch(next);
    };
  }

  __getNextFunctionFromHandlerArguments(args) {
    const copyArgs = Array.from(args);
    const possibleNext = copyArgs.at(-1);

    if (typeof possibleNext === "function") {
      return possibleNext;
    } else {
      return copyArgs.find((a) => typeof a === "function");
    }
  }

  __wrapHandlersWithAsync(handlers) {
    return handlers.map((handler) => {
      if (typeof handler === "function") {
        return this.asyncRouteHandler(handler);
      }

      return handler;
    });
  }

  __createAsyncRouter() {
    const router = this.express.Router();
    methods.forEach((m) => {
      const method = m.toLowerCase();
      const routerMethod = router[method];

      const handler = function (path, ...handlers) {
        return routerMethod.call(
          router,
          path,
          ...this.__wrapHandlersWithAsync(handlers)
        );
      };

      if (routerMethod) {
        router[method] = handler.bind(this);
      }
    });
    return router;
  }

  static implementAsyncRouter(express, asyncRouteHandler) {
    new this(express, asyncRouteHandler);
  }
}

module.exports = AsyncRouter;

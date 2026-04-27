import type { FastifyInstance, FastifyReply } from "fastify";
import type {
  AddItemToOrder,
  AddItemToOrderDto,
  AppError,
  CreateOrder,
  CreateOrderDto,
} from "../../../application/index.js";
import { validationError } from "../../../application/index.js";

type AddItemParams = {
  readonly orderId: string;
};

type OrdersControllerDependencies = {
  readonly createOrder: CreateOrder;
  readonly addItemToOrder: AddItemToOrder;
};

type ErrorResponse = {
  readonly error: {
    readonly type: AppError["type"];
    readonly code: string;
    readonly message: string;
  };
};

export class OrdersController {
  public constructor(private readonly dependencies: OrdersControllerDependencies) {}

  public async register(app: FastifyInstance): Promise<void> {
    app.post<{ Body: unknown }>("/orders", async (request, reply) => {
      const dto = this.parseCreateOrderDto(request.body);

      if ("error" in dto) {
        return this.replyError(reply, dto.error);
      }

      const result = await this.dependencies.createOrder.execute(dto.data);

      if (result.isFailure) {
        return this.replyError(reply, result.error);
      }

      return reply.code(201).send(result.data);
    });

    app.post<{ Params: AddItemParams; Body: unknown }>(
      "/orders/:orderId/items",
      async (request, reply) => {
        const dto = this.parseAddItemToOrderDto(request.params.orderId, request.body);

        if ("error" in dto) {
          return this.replyError(reply, dto.error);
        }

        const result = await this.dependencies.addItemToOrder.execute(dto.data);

        if (result.isFailure) {
          return this.replyError(reply, result.error);
        }

        return reply.code(200).send(result.data);
      },
    );
  }

  private parseCreateOrderDto(body: unknown): { data: CreateOrderDto } | { error: AppError } {
    if (!this.isRecord(body)) {
      return {
        error: validationError("request.body.invalid", "Request body must be an object."),
      };
    }

    if (typeof body.orderId !== "string" || typeof body.customerId !== "string") {
      return {
        error: validationError(
          "request.body.invalid",
          "Request body must include string orderId and customerId.",
        ),
      };
    }

    return {
      data: {
        orderId: body.orderId,
        customerId: body.customerId,
      },
    };
  }

  private parseAddItemToOrderDto(
    orderId: string,
    body: unknown,
  ): { data: AddItemToOrderDto } | { error: AppError } {
    if (!this.isRecord(body)) {
      return {
        error: validationError("request.body.invalid", "Request body must be an object."),
      };
    }

    if (
      typeof body.itemId !== "string" ||
      typeof body.sku !== "string" ||
      typeof body.quantity !== "number"
    ) {
      return {
        error: validationError(
          "request.body.invalid",
          "Request body must include string itemId, string sku, and number quantity.",
        ),
      };
    }

    return {
      data: {
        orderId,
        itemId: body.itemId,
        sku: body.sku,
        quantity: body.quantity,
      },
    };
  }

  private replyError(reply: FastifyReply, error: AppError): FastifyReply {
    const statusCode = this.statusCodeFor(error);
    const response: ErrorResponse = {
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
      },
    };

    return reply.code(statusCode).send(response);
  }

  private statusCodeFor(error: AppError): number {
    switch (error.type) {
      case "validation":
        return 400;
      case "not_found":
        return 404;
      case "conflict":
        return 409;
      case "infra":
        return 500;
    }
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}

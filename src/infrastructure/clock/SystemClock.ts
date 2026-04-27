import type { Clock } from "../../application/ports/Clock.js";

export class SystemClock implements Clock {
  public now(): Date {
    return new Date();
  }
}

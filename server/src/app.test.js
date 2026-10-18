
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.js";

describe("OpsRadar API", () => {
  it("should return OK from the health-check endpoint", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "OpsRadar API is running",
      status: "OK",
    });
  });

  it("should return JSON from the health-check endpoint", async () => {
    const response = await request(app).get("/");

    expect(response.headers["content-type"]).toContain("application/json");
  });
});

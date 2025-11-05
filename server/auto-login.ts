import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export function registerAutoLoginRoute(app: Express) {
  app.get("/api/auto-login", async (req: Request, res: Response) => {
    const token = req.query.token as string;
    
    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[AutoLogin] Failed", error);
      res.status(500).json({ error: "Auto login failed" });
    }
  });
}

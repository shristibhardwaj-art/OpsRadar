
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        memberships: {
          select: {
            teamId: true,
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

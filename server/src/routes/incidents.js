
import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

const createIncidentSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(1).max(10000),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  teamId: z.string().min(1),
  assigneeId: z.string().min(1).optional()
});

const updateIncidentSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().min(1).max(10000).optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum([
    "OPEN",
    "INVESTIGATING",
    "MITIGATED",
    "RESOLVED",
    "CLOSED"
  ]).optional(),
  assigneeId: z.string().min(1).nullable().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "Provide at least one field to update"
});

async function getMembership(userId, teamId) {
  return prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId, teamId }
    }
  });
}

function canManage(role) {
  return role === "ADMIN" || role === "RESPONDER";
}

// List incidents belonging to the current user's teams.
router.get("/", async (req, res, next) => {
  try {
    const memberships = req.user.memberships;

    const teamIds = memberships.map((membership) => membership.teamId);

    const incidents = await prisma.incident.findMany({
      where: { teamId: { in: teamIds } },
      include: {
        team: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { updatedAt: "desc" }
    });

    res.json({ incidents });
  } catch (error) {
    next(error);
  }
});

// Create an incident in a team the user belongs to.
router.post("/", async (req, res, next) => {
  try {
    const parsed = createIncidentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid incident details",
        details: parsed.error.flatten()
      });
    }

    const data = parsed.data;
    const membership = await getMembership(req.user.id, data.teamId);

    if (!membership) {
      return res.status(403).json({
        error: "You are not a member of this team"
      });
    }

    if (!canManage(membership.role)) {
      return res.status(403).json({
        error: "You do not have permission to create incidents"
      });
    }

    if (data.assigneeId) {
      const assigneeMembership = await getMembership(
        data.assigneeId,
        data.teamId
      );

      if (!assigneeMembership) {
        return res.status(400).json({
          error: "Assignee must belong to the incident team"
        });
      }
    }

    const incident = await prisma.$transaction(async (tx) => {
      const created = await tx.incident.create({
        data: {
          title: data.title,
          description: data.description,
          severity: data.severity,
          teamId: data.teamId,
          assigneeId: data.assigneeId
        },
        include: {
          team: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } }
        }
      });

      await tx.activity.create({
        data: {
          action: "INCIDENT_CREATED",
          incidentId: created.id,
          userId: req.user.id,
          details: { title: created.title, severity: created.severity }
        }
      });

      return created;
    });

    res.status(201).json({ incident });
  } catch (error) {
    next(error);
  }
});

// View one incident, provided the user belongs to its team.
router.get("/:id", async (req, res, next) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        team: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        activities: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } }
          }
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const membership = await getMembership(req.user.id, incident.teamId);

    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ incident });
  } catch (error) {
    next(error);
  }
});

// Update an incident using optimistic version checking.
router.patch("/:id", async (req, res, next) => {
  try {
    const parsed = updateIncidentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid update details",
        details: parsed.error.flatten()
      });
    }

    const data = parsed.data;

    const existing = await prisma.incident.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const membership = await getMembership(req.user.id, existing.teamId);

    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!canManage(membership.role)) {
      return res.status(403).json({
        error: "You do not have permission to update incidents"
      });
    }

    if (data.assigneeId) {
      const assigneeMembership = await getMembership(
        data.assigneeId,
        existing.teamId
      );

      if (!assigneeMembership) {
        return res.status(400).json({
          error: "Assignee must belong to the incident team"
        });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.incident.updateMany({
        where: {
          id: existing.id,
          version: existing.version
        },
        data: {
          ...data,
          version: { increment: 1 },
          resolvedAt:
            data.status === "RESOLVED"
              ? new Date()
              : data.status
                ? null
                : undefined
        }
      });

      if (result.count === 0) {
        return null;
      }

      const incident = await tx.incident.findUnique({
        where: { id: existing.id },
        include: {
          team: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } }
        }
      });

      await tx.activity.create({
        data: {
          action: "INCIDENT_UPDATED",
          incidentId: incident.id,
          userId: req.user.id,
          details: data
        }
      });

      return incident;
    });

    if (!updated) {
      return res.status(409).json({
        error: "Incident was updated by someone else. Refresh and retry."
      });
    }

    res.json({ incident: updated });
  } catch (error) {
    next(error);
  }
});

export default router;

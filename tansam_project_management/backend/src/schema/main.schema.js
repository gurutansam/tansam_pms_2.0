import { createAdminSchemas } from "./admin/admin.schema.js";
import { createCoordinatorSchemas } from "./coordinator/coordinator.schema.js";
import { createProjectSchemas } from "./project/project.schema.js";
import { createAssignTeamSchema } from "./project/assignTeam/assignTeam.schema.js";
import { createDepartmentSchema } from "./project/department/department.schema.js";
import { createMemberSchema } from "./project/member/member.schema.js";
import { createQuotationFollowupsSchema } from "./finance/finance.schema.js";
import { createProjectTypeSchema } from "./project/projectType/projectType.schema.js";
import { createProjectFollowupSchema } from "./project/projectfollowup/projectFollowup.schema.js";
import { createCeoForecastSchema } from "./Ceo/Ceoforecast.schema.js";

const initializedSchemas = new Set();
const pendingSchemas = new Map();

const ensureSchema = async (name, createSchema) => {
  if (initializedSchemas.has(name)) return;
  if (!pendingSchemas.has(name)) {
    const task = Promise.resolve()
      .then(createSchema)
      .then(() => initializedSchemas.add(name))
      .finally(() => pendingSchemas.delete(name));
    pendingSchemas.set(name, task);
  }
  await pendingSchemas.get(name);
};

/**
 * Initializes only schemas that have not already been created in this process.
 * Requests can continue calling this safely without re-running CREATE TABLE DDL.
 */
export const initSchemas = async (db, options = {}) => {
  // Phase 1: Base schemas (no FK dependencies on each other) run in parallel
  const phase1Tasks = [];
  if (options.admin) phase1Tasks.push(ensureSchema("admin", () => createAdminSchemas(db)));
  if (options.coordinator) phase1Tasks.push(ensureSchema("coordinator", () => createCoordinatorSchemas(db)));
  if (options.project) phase1Tasks.push(ensureSchema("project", () => createProjectSchemas(db)));
  if (options.department) phase1Tasks.push(ensureSchema("department", () => createDepartmentSchema(db)));
  if (options.projectType) phase1Tasks.push(ensureSchema("projectType", () => createProjectTypeSchema(db)));
  await Promise.all(phase1Tasks);

  // Phase 2: Schemas with FK references to Phase 1 tables run in parallel
  const phase2Tasks = [];
  if (options.member) phase2Tasks.push(ensureSchema("member", () => createMemberSchema(db)));
  if (options.finance) phase2Tasks.push(ensureSchema("finance", () => createQuotationFollowupsSchema(db)));
  if (options.projectFollowup) phase2Tasks.push(ensureSchema("projectFollowup", () => createProjectFollowupSchema(db)));
  if (options.createCeoForecastSchema) phase2Tasks.push(ensureSchema("ceoForecast", () => createCeoForecastSchema(db)));
  if (options.assignTeam) phase2Tasks.push(ensureSchema("assignTeam", () => createAssignTeamSchema(db)));
  await Promise.all(phase2Tasks);
};
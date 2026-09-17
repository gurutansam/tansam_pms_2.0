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
  if (options.admin) await ensureSchema("admin", () => createAdminSchemas(db));
  if (options.coordinator) await ensureSchema("coordinator", () => createCoordinatorSchemas(db));
  if (options.project) await ensureSchema("project", () => createProjectSchemas(db));
  if (options.department) await ensureSchema("department", () => createDepartmentSchema(db));
  if (options.member) await ensureSchema("member", () => createMemberSchema(db));
  if (options.projectType) await ensureSchema("projectType", () => createProjectTypeSchema(db));
  if (options.finance) await ensureSchema("finance", () => createQuotationFollowupsSchema(db));
  if (options.projectFollowup) await ensureSchema("projectFollowup", () => createProjectFollowupSchema(db));
  if (options.createCeoForecastSchema) await ensureSchema("ceoForecast", () => createCeoForecastSchema(db));
  if (options.assignTeam) await ensureSchema("assignTeam", () => createAssignTeamSchema(db));
};
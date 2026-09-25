import { connectDB } from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * GET roles (ADMIN only)
 */
export const getRoles = async (req, res) => {
  try {
    const db = await connectDB();
    const [roles] = await db.execute(
      "SELECT id, name, status FROM roles ORDER BY id"
    );

    res.json(roles);
  } catch (err) {
    console.error("Get roles error:", err);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
};

/**
 * CREATE role (ADMIN only)
 */
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "INSERT INTO roles (name) VALUES (?)",
      [name.toUpperCase()]
    );

    res.status(201).json({ message: "Role created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Role already exists" });
    }

    console.error("Create role error:", err);
    res.status(500).json({ message: "Failed to create role" });
  }
};

/**
 * UPDATE role (ADMIN only)
 */
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const db = await connectDB();

    await db.execute(
      "UPDATE roles SET name=?, status=? WHERE id=?",
      [name.toUpperCase(), status || "ACTIVE", id]
    );

    res.json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
};

/**
 * DELETE role (ADMIN only)
 */
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const [result] = await db.execute("DELETE FROM roles WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Delete role error:", err);
    res.status(500).json({ message: "Failed to delete role" });
  }
};

/**
 * GET labs (ADMIN only)
 */
export const getLabs = async (req, res) => {
  try {
    const db = await connectDB();
    const [labs] = await db.execute(
      "SELECT id, name, status FROM labs_admin ORDER BY id"
    );

    res.json(labs);
  } catch (err) {
    console.error("Get labs error:", err);
    res.status(500).json({ message: "Failed to fetch labs_admin" });
  }
};

/**
 * CREATE lab (ADMIN only)
 */
export const createLab = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Lab name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "INSERT INTO labs_admin (name, status) VALUES (?, ?)",
      [name.trim(), status || "ACTIVE"]
    );

    res.status(201).json({ message: "labs_admin created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "labs_admin already exists" });
    }

    console.error("Create lab error:", err);
    res.status(500).json({ message: "Failed to create labs_admin" });
  }
};

/**
 * UPDATE lab (ADMIN only)
 */
export const updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Lab name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "UPDATE labs_admin SET name=?, status=? WHERE id=?",
      [name.trim(), status || "ACTIVE", id]
    );

    res.json({ message: "labs_admin updated successfully" });
  } catch (err) {
    console.error("Update labs_admin error:", err);
    res.status(500).json({ message: "Failed to update labs_admin" });
  }
};

/**
 * DELETE lab (ADMIN only)
 */
export const deleteLab = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const [result] = await db.execute("DELETE FROM labs_admin WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Lab not found" });
    }

    res.json({ message: "Lab deleted successfully" });
  } catch (err) {
    console.error("Delete lab error:", err);
    res.status(500).json({ message: "Failed to delete lab" });
  }
};
/**
 * GET project types (ADMIN only)
 */
export const getProjectTypes = async (req, res) => {
  try {
    const db = await connectDB();
    const [types] = await db.execute(
      "SELECT id, name, status FROM project_types_admin ORDER BY id"
    );

    res.json(types);
  } catch (err) {
    console.error("Get project types error:", err);
    res.status(500).json({ message: "Failed to fetch project types" });
  }
};

/**
 * CREATE project type (ADMIN only)
 */
export const createProjectType = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Project type name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "INSERT INTO project_types_admin (name, status) VALUES (?, ?)",
      [name.trim(), status || "ACTIVE"]
    );

    res.status(201).json({ message: "Project type created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Project type already exists" });
    }

    console.error("Create project type error:", err);
    res.status(500).json({ message: "Failed to create project type" });
  }
};

/**
 * UPDATE project type (ADMIN only)
 */
export const updateProjectType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Project type name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "UPDATE project_types_admin SET name=?, status=? WHERE id=?",
      [name.trim(), status || "ACTIVE", id]
    );

    res.json({ message: "project_types_admin type updated successfully" });
  } catch (err) {
    console.error("Update project_types_admin type error:", err);
    res.status(500).json({ message: "Failed to update project_types_admin type" });
  }
};

/**
 * DELETE project type (ADMIN only)
 */
export const deleteProjectType = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const [result] = await db.execute("DELETE FROM project_types_admin WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project type not found" });
    }

    res.json({ message: "Project type deleted successfully" });
  } catch (err) {
    console.error("Delete project type error:", err);
    res.status(500).json({ message: "Failed to delete project type" });
  }
};

/**
 * GET client types (ADMIN only)
 */
export const getClientTypes = async (req, res) => {
  try {
    const db = await connectDB();
    const [types] = await db.execute(
      "SELECT id, name, status FROM client_types_admin ORDER BY id"
    );

    res.json(types);
  } catch (err) {
    console.error("Get client types error:", err);
    res.status(500).json({ message: "Failed to fetch client types" });
  }
};
/**
 * CREATE client type (ADMIN only)
 */
export const createClientType = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Client type name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "INSERT INTO client_types_admin (name, status) VALUES (?, ?)",
      [name.trim().toUpperCase(), status || "ACTIVE"]
    );

    res.status(201).json({ message: "Client type created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Client type already exists" });
    }

    console.error("Create client type error:", err);
    res.status(500).json({ message: "Failed to create client type" });
  }
};


/**
 * UPDATE client type (ADMIN only)
 */
export const updateClientType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Client type name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "UPDATE client_types_admin SET name=?, status=? WHERE id=?",
      [name.trim().toUpperCase(), status || "ACTIVE", id]
    );

    res.json({ message: "Client type updated successfully" });
  } catch (err) {
    console.error("Update client type error:", err);
    res.status(500).json({ message: "Failed to update client type" });
  }
};

/**
 * DELETE client type (ADMIN only)
 */
export const deleteClientType = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const [result] = await db.execute("DELETE FROM client_types_admin WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client type not found" });
    }

    res.json({ message: "Client type deleted successfully" });
  } catch (err) {
    console.error("Delete client type error:", err);
    res.status(500).json({ message: "Failed to delete client type" });
  }
};


/**
 * GET work categories (ADMIN only)
 */
export const getWorkCategories = async (req, res) => {
  try {
    const db = await connectDB();
    const [categories] = await db.execute(
      "SELECT id, name, status FROM work_categories ORDER BY id"
    );

    res.json(categories);
  } catch (err) {
    console.error("Get work categories error:", err);
    res.status(500).json({ message: "Failed to fetch work categories" });
  }
};

/**
 * CREATE work category (ADMIN only)
 */
export const createWorkCategory = async (req, res) => {
  try {
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Work category name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "INSERT INTO work_categories (name, status) VALUES (?, ?)",
      [name.trim(), status || "ACTIVE"]
    );

    res.status(201).json({ message: "Work category created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Work category already exists" });
    }

    console.error("Create work category error:", err);
    res.status(500).json({ message: "Failed to create work category" });
  }
};

/**
 * UPDATE work category (ADMIN only)
 */
export const updateWorkCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Work category name is required" });
    }

    const db = await connectDB();
    await db.execute(
      "UPDATE work_categories SET name=?, status=? WHERE id=?",
      [name.trim(), status || "ACTIVE", id]
    );

    res.json({ message: "Work category updated successfully" });
  } catch (err) {
    console.error("Update work category error:", err);
    res.status(500).json({ message: "Failed to update work category" });
  }
};

/**
 * DELETE work category (ADMIN only)
 */
export const deleteWorkCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const [result] = await db.execute("DELETE FROM work_categories WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Work category not found" });
    }

    res.json({ message: "Work category deleted successfully" });
  } catch (err) {
    console.error("Delete work category error:", err);
    res.status(500).json({ message: "Failed to delete work category" });
  }
};

/**
 * GET users (ADMIN only)
 */
export const getUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const [users] = await db.execute(`
      SELECT id, name, mobile, email, role, lab, status
      FROM users_admin
      ORDER BY id
    `);

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * CREATE user (ADMIN only)
 */
export const createUser = async (req, res) => {
  try {
    const { name, mobile, email, role, lab, password, status } = req.body;

    if (!name || !mobile || !email || !role || !password) {
      return res.status(400).json({
        message: "Name, mobile, email, role and password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await connectDB();
    await db.execute(
      `
      INSERT INTO users_admin
        (name, mobile, email, role, lab, password, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        mobile.trim(),
        email.trim().toLowerCase(),
        role,
        lab || null,
        hashedPassword,
        status || "ACTIVE",
      ]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    console.error("Create user error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/**
 * UPDATE user (ADMIN only)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, lab, status } = req.body;

    const db = await connectDB();
    await db.execute(
      `
      UPDATE users_admin
      SET role=?, lab=?, status=?
      WHERE id=?
      `,
      [role, lab, status || "ACTIVE", id]
    );

    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

/**
 * GET Admin Dashboard Counts (ADMIN only)
 */
/**
 * GET Admin Dashboard Detailed Counts (ADMIN only)
 */
export const getAdminDashboardCounts = async (req, res) => {
  try {
    const db = await connectDB();
    const [
      [roles],
      [labs],
      [projectTypes],
      [clientTypes],
      [workCategories],
      [users],
    ] = await Promise.all([
      db.execute(`
        SELECT 
          COUNT(*) AS total,
          SUM(status='ACTIVE') AS active,
          SUM(status='INACTIVE') AS inactive
        FROM roles
      `),

      db.execute(`
        SELECT 
          COUNT(*) AS total,
          SUM(status='ACTIVE') AS active,
          SUM(status='INACTIVE') AS inactive
        FROM labs_admin
      `),

      db.execute(`
        SELECT 
          COUNT(*) AS total,
          SUM(status='ACTIVE') AS active,
          SUM(status='INACTIVE') AS inactive
        FROM project_types_admin
      `),

      db.execute(`
        SELECT 
          COUNT(*) AS total,
          SUM(status='ACTIVE') AS active,
          SUM(status='INACTIVE') AS inactive
        FROM client_types_admin
      `),

      db.execute(`
        SELECT 
          COUNT(*) AS total,
          SUM(status='ACTIVE') AS active,
          SUM(status='INACTIVE') AS inactive
        FROM work_categories
      `),

      db.execute(`
        SELECT 
          COUNT(*) AS total,
          SUM(status='ACTIVE') AS active,
          SUM(status='INACTIVE') AS inactive
        FROM users_admin
      `),
    ]);

    res.json({
      roles: roles[0],
      labs: labs[0],
      projectTypes: projectTypes[0],
      clientTypes: clientTypes[0],
      workCategories: workCategories[0],
      users: users[0],
    });

  } catch (err) {
    console.error("Admin detailed counts error:", err);
    res.status(500).json({ message: "Failed to fetch detailed dashboard counts" });
  }
};
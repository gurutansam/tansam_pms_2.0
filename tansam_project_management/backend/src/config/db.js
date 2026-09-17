import mysql from "mysql2/promise";

let pool;

export const ensureDatabaseExists = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 3306,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );

    console.log(`Database '${process.env.DB_NAME}' ensured`);
  } finally {
    await connection.end();
  }
};

export const connectDB = async () => {
  if (pool) {
    return pool;
  }

  const connectionLimit =
    Number(process.env.DB_CONNECTION_LIMIT) || 10;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,

    waitForConnections: true,
    connectionLimit,
    maxIdle: connectionLimit,
    idleTimeout: 60_000,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    dateStrings: true,
  });

  console.log(
    `MySQL pool created (max ${connectionLimit} connections)`
  );

  return pool;
};

export const closeDB = async () => {
  if (!pool) {
    return;
  }

  const activePool = pool;
  pool = undefined;

  await activePool.end();

  console.log("MySQL pool closed");
};
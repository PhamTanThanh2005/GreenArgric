import sql from "mssql"

const config = {
    user: process.env.DB_USER || "hieu",
    password: process.env.DB_PASSWORD || "hieu",
    server: process.env.DB_SERVER || "127.0.0.1",
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || "green-farm",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}
 
const pool = await sql.connect(config)

export default pool
export { sql }
// import sql from "mssql"

// const config = {
//     user: "hieu",
//     password: "hieu",
//     server: "127.0.0.1",
//     port: 1433,
//     database: "green-farm",
//     options: {
//         encrypt: false,
//         trustServerCertificate: true
//     }
// }

// const pool = await sql.connect(config)

// export default pool
// export { sql }

import sql from "mssql"

const config = {
    user: "hieu",
    password: "hieu",
    server: "localhost",
    database: "green-farm",
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: "SQLEXPRESS"
    }
}

const pool = await sql.connect(config)

export default pool
export { sql }
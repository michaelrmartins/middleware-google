// src/models/LogModel.js
const db = require('../config/database'); 

const LogModel = {
  /**
   * record a new log entry in the database
   * @param {Object} data - log data
   */

  async create(data) {
    const query = `
      INSERT INTO request_logs 
      (tenant_id, endpoint, http_method, status_code, request_payload, response_body, ip_address, duration_ms)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;

    const values = [
      data.tenant_id,      // 'fmc' ou 'fbpn', 1 or 2
      data.endpoint,       // ex: '/email-create'
      data.http_method,    // 'POST'
      data.status_code,    // 200, 400, 500
      data.request_payload,// O JSON from client
      data.response_body,  // O JSON from server
      data.ip_address,     // Client IP
      data.duration_ms     // duration in milliseconds
    ];

    try {
      const { rows } = await db.query(query, values);
      // console.log(`Log gravado com sucesso. ID: ${rows[0].id}`);
      return rows[0];
    } catch (error) {
      console.error('Write database data error', error.message);
      return null;
    }
  }
};


module.exports = LogModel;
// Query postgres poll model

const getAlllogsQuery = `SELECT * FROM public.request_logs`;
const getLogsAllTenantsQuery = `SELECT * FROM public.tenants`;
const getLogsByTenantIdQuery = `SELECT * FROM public.request_logs where tenant_id = $1`;
const getLogsByStatusCodeQuery = `SELECT * FROM public.request_logs where status_code = $1`;
const getLogsByEndpointQuery = `SELECT * FROM public.request_logs where endpoint = $1`;
const getLogsByHttpMethod = `SELECT * FROM public.request_logs where http_method = $1`;
const getLogsByDateRangeQuery = `SELECT * FROM public.request_logs where created_at >= $1 AND created_at <= $2`; // get log by date range, received data format: ddmmyyyy 

module.exports = {
    getAlllogsQuery,
    getLogsAllTenantsQuery,
    getLogsByTenantIdQuery,
    getLogsByStatusCodeQuery,
    getLogsByEndpointQuery,
    getLogsByHttpMethod,
    getLogsByDateRangeQuery
};
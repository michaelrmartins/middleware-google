// Query postgres poll model

const getAlllogsQuery = `SELECT * FROM public.request_logs`;
const getLogsByTenantQuery = `SELECT * FROM public.request_logs where tenant_id = $1`;
const getLogsByStatusCodeQuery = `SELECT * FROM public.request_logs where status_code = $1`;
const getLogsByEndpointQuery = `SELECT * FROM public.request_logs where endpoint = $1`;
const getLogsByHttpMethod = `SELECT * FROM public.request_logs where http_method = $1`;

module.exports = {
    getAlllogsQuery,
    getLogsByTenantQuery,
    getLogsByStatusCodeQuery,
    getLogsByEndpointQuery,
    getLogsByHttpMethod
};
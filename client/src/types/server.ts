// RESTful API
export const RESTServerRoute = {
  REST_UPLOAD_PDF: "api/upload/pdf",
  REST_UPLOAD_URL: "api/upload/url",
  REST_UPLOAD_CONTENT: "api/upload/content",
  REST_UPLOAD_VTT: "api/upload/vtt",

  REST_GET_SOURCES: "api/sources",
  REST_DELETE_SOURCE: (id: string) => `api/source/${id}`,
  
  REST_CHAT: "api/chat",

}
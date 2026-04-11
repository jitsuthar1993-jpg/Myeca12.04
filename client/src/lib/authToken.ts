export async function getAuthToken() {
  return sessionStorage.getItem("token");
}

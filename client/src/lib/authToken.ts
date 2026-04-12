export async function getAuthToken() {
  return sessionStorage.getItem("token");
}

export function setAuthToken(token: string) {
  sessionStorage.setItem("token", token);
}

export function clearAuthToken() {
  sessionStorage.removeItem("token");
}

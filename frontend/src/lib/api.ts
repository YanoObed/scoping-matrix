const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

const TOKEN_KEY =
  "scoping_matrix_access_token";


export function getAccessToken() {
  return localStorage.getItem(
    TOKEN_KEY,
  );
}


export function setAccessToken(
  token: string,
) {
  localStorage.setItem(
    TOKEN_KEY,
    token,
  );
}


export function clearAccessToken() {
  localStorage.removeItem(
    TOKEN_KEY,
  );
}


function errorMessage(
  data: unknown,
) {
  if (
    !data ||
    typeof data !== "object" ||
    !("detail" in data)
  ) {
    return "Something went wrong";
  }


  const detail = (
    data as {
      detail?: unknown;
    }
  ).detail;


  if (
    typeof detail === "string"
  ) {
    return detail;
  }


  if (Array.isArray(detail)) {
    const messages =
      detail
        .map((item) => {
          if (
            !item ||
            typeof item !== "object" ||
            !("msg" in item)
          ) {
            return null;
          }


          const message = (
            item as {
              msg?: unknown;
            }
          ).msg;

          const location = (
            item as {
              loc?: unknown;
            }
          ).loc;


          if (
            typeof message !==
            "string"
          ) {
            return null;
          }


          if (
            Array.isArray(location)
          ) {
            const field =
              location
                .filter(
                  (part) =>
                    part !==
                      "body" &&
                    part !==
                      "query" &&
                    part !==
                      "path",
                )
                .join(".");

            return field
              ? `${field}: ${message}`
              : message;
          }


          return message;
        })
        .filter(Boolean);


    if (messages.length) {
      return messages.join(". ");
    }
  }


  return "Something went wrong";
}


export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(
      options.headers,
    );


  if (
    options.body &&
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }


  const token =
    getAccessToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }


  const response =
    await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,
        headers,
      },
    );


  if (
    response.status === 204
  ) {
    return undefined as T;
  }


  let data: unknown = null;

  try {
    data =
      await response.json();
  } catch {
    // Response has no JSON body.
  }


  if (!response.ok) {
    if (
      response.status === 401
    ) {
      clearAccessToken();
    }

    throw new Error(
      errorMessage(data),
    );
  }


  return data as T;
}


const API_URL = "http://127.0.0.1:8002";


export interface Application {
  id: number;
  company: string;
  role: string;
  date: string;
  status: "Applied" | "Interview" | "Assessment" | "Rejected" | "Selected";
}

export type NewApplication = Omit<Application, "id">;

interface ApplicationsResponse {
  total: number;
  applications: Application[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong");
  }

  return response.json() as Promise<T>;
}

// Fetch all applications
export async function getApplications(): Promise<ApplicationsResponse> {
  const response = await fetch(`${API_URL}/applications`);
  return handleResponse<ApplicationsResponse>(response);
}

// Add a new application
export async function createApplication(
  application: NewApplication
): Promise<Application> {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(application),
  });

  const result = await handleResponse<{
    message: string;
    application: Application;
  }>(response);

  return result.application;
}

// Update an existing application
export async function updateApplication(
  id: number,
  application: NewApplication
): Promise<Application> {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(application),
  });

  const result = await handleResponse<{
    message: string;
    application: Application;
  }>(response);

  return result.application;
}

// Delete an application
export async function deleteApplication(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/applications/${id}`, {
    method: "DELETE",
  });

  await handleResponse<{ message: string; application: Application }>(
    response
  );
}

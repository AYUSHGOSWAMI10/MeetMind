// Thin wrappers around the EXISTING backend endpoints. Paths, methods, request
// bodies and the response properties that are read are unchanged.
const API = "";

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API}${path}`, options);
  } catch {
    throw new Error("Could not reach the MeetMind backend. Check that the server is running.");
  }
  let json = {};
  try {
    json = await response.json();
  } catch {
    // Non-JSON body (e.g. proxy error); callers fall back to a default message.
  }
  return { response, json };
}

const jsonPost = (body) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export async function getIntegrations() {
  const { response, json } = await request("/api/integrations");
  if (!response.ok || !json.success) throw new Error(json.error || "Could not read integration status.");
  return json.data;
}

export async function listMeetings() {
  const { response, json } = await request("/api/meetings");
  if (!response.ok) throw new Error(json.error || "Could not load saved meetings.");
  return json.data;
}

export async function getMeeting(id) {
  const { response, json } = await request(`/api/meetings/${id}`);
  if (!response.ok) throw new Error(json.error || "Could not open meeting.");
  return json.data;
}

export async function removeMeeting(id) {
  const { response, json } = await request(`/api/meetings/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(json.error || "Could not delete meeting.");
}

export async function analyzeTranscript(transcript) {
  const { response, json } = await request("/api/analyze", jsonPost({ transcript }));
  if (!response.ok || !json.success) throw new Error(json.details || json.error || "Analysis failed.");
  return json.data;
}

export async function sendRecapEmail(id, to) {
  const { response, json } = await request(`/api/meetings/${id}/email`, jsonPost({ to }));
  if (!response.ok || !json.success) throw new Error(json.error || "Could not send recap.");
  return json.data;
}

export async function scheduleCalendarEvent(id, start, end) {
  const { response, json } = await request(`/api/meetings/${id}/calendar`, jsonPost({ start, end }));
  if (!response.ok || !json.success) throw new Error(json.error || "Could not schedule follow-up.");
  return json.data;
}

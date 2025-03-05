import { toast } from "sonner";

export function ToastMessage(message: string = "", code: number) {
  let formattedMessage = "";
  let type: "success" | "error" | "warning" | "info";

  // Determine toast type based on status code
  if (code >= 200 && code < 300) {
    type = "success";
  } else if (code >= 400 && code < 500) {
    type = "error";
  } else if (code === 429) {
    type = "warning";
  } else if (code >= 500) {
    type = "error";
  } else {
    type = "info";
  }

  // Handling different status codes
  if (type === "success") {
    if (code === 200) {
      formattedMessage = `${message} has been successfully updated!`;
    } else if (code === 201) {
      formattedMessage = `${message} has been successfully added!`;
    } else if (code === 204) {
      formattedMessage = `${message} has been successfully deleted!`;
    } else {
      formattedMessage = `${message} action was successful!`;
    }
  } else if (type === "error") {
    if (code === 400) {
      formattedMessage = `Bad Request: Invalid ${message} data.`;
    } else if (code === 401) {
      formattedMessage = `Unauthorized: You need to log in to access ${message}.`;
    } else if (code === 403) {
      formattedMessage = `Forbidden: You don’t have permission to access ${message}.`;
    } else if (code === 404) {
      formattedMessage = `Not Found: ${message} does not exist.`;
    } else if (code === 500) {
      formattedMessage = `Server Error: Something went wrong with ${message}.`;
    } else {
      formattedMessage = `Error processing ${message}. Please try again.`;
    }
  } else if (type === "warning") {
    formattedMessage = `Too Many Requests: Please slow down while accessing ${message}.`;
  } else if (type === "info") {
    formattedMessage = `Info: ${message} update is available.`;
  }

  setTimeout(() => {
    toast[type](formattedMessage, { position: "bottom-right" });
  },150);
}

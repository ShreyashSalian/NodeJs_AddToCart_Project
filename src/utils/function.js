export const trimInput = (value) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

export const phoneNumberValidator = (value) => {
  const cleanedValue = value.replace(/[\s-]/g, "");

  if (cleanedValue.length === 10) {
    // phoneNumber with spaces or hyphens should have a length of 10
    return true;
  }
  // Return false for any other case
  return false;
};

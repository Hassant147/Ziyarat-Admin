const PAKISTAN_COUNTRY_CODE = "+92";
const PAKISTAN_MOBILE_REGEX = /^\+923\d{9}$/;

const digitsOnly = (value = "") => `${value}`.replace(/\D/g, "");

export const normalizePhoneNumber = (phoneNumber = "") => {
  return `${phoneNumber}`.replace(/[^\d+]/g, "");
};

export const getPakistanLocalDigits = (phoneNumber = "") => {
  const rawDigits = digitsOnly(phoneNumber);
  let localDigits = rawDigits;

  if (localDigits.startsWith("92")) {
    localDigits = localDigits.slice(2);
  }

  return localDigits;
};

export const sanitizePakistanPhoneNumber = (phoneNumber = "") => {
  let localDigits = getPakistanLocalDigits(phoneNumber);
  localDigits = localDigits.replace(/^0+/, "");

  if (!localDigits) {
    return "";
  }

  return `${PAKISTAN_COUNTRY_CODE}${localDigits}`;
};

export const getPakistanPhoneInputState = (phoneNumber = "") => {
  const localDigits = getPakistanLocalDigits(phoneNumber);

  if (!localDigits) {
    return {
      isAllowed: true,
      normalizedPhoneNumber: "",
      error: "",
    };
  }

  if (localDigits.startsWith("0")) {
    return {
      isAllowed: false,
      normalizedPhoneNumber: "",
      error: "Do not start number with 0 after +92",
    };
  }

  if (localDigits.length > 10) {
    return {
      isAllowed: false,
      normalizedPhoneNumber: `${PAKISTAN_COUNTRY_CODE}${localDigits.slice(0, 10)}`,
      error: "Pakistan mobile number cannot exceed 10 digits",
    };
  }

  return {
    isAllowed: true,
    normalizedPhoneNumber: `${PAKISTAN_COUNTRY_CODE}${localDigits}`,
    error: "",
  };
};

export const validatePhoneNumberForLogin = (phoneNumber) => {
  const normalizedPhoneNumber = sanitizePakistanPhoneNumber(phoneNumber);
  const localDigits = getPakistanLocalDigits(phoneNumber);

  if (!normalizedPhoneNumber) {
    return {
      isValid: false,
      normalizedPhoneNumber: "",
      error: "Phone number is required",
    };
  }

  if (localDigits.startsWith("0")) {
    return {
      isValid: false,
      normalizedPhoneNumber,
      error: "Do not include 0 after +92",
    };
  }

  if (localDigits.length !== 10) {
    return {
      isValid: false,
      normalizedPhoneNumber,
      error: "Pakistan mobile number must be exactly 10 digits",
    };
  }

  if (!PAKISTAN_MOBILE_REGEX.test(normalizedPhoneNumber)) {
    return {
      isValid: false,
      normalizedPhoneNumber,
      error: "Enter a valid Pakistan mobile number (e.g. +923XXXXXXXXX)",
    };
  }

  return {
    isValid: true,
    normalizedPhoneNumber,
    error: "",
  };
};

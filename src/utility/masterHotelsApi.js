import adminApiClient from "./adminApiClient";

const MASTER_HOTELS_ENDPOINT = "/management/manage_master_hotels/";

const buildMasterHotelFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || key === "images" || key === "delete_image_ids") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          formData.append(key, String(item));
        }
      });
      return;
    }

    formData.append(key, typeof value === "boolean" ? String(value) : String(value));
  });

  const imageFiles = Array.isArray(payload.images) ? payload.images : [];
  imageFiles.forEach((file) => {
    if (typeof Blob !== "undefined" && file instanceof Blob) {
      formData.append("images", file);
    }
  });

  const deleteImageIds = Array.isArray(payload.delete_image_ids) ? payload.delete_image_ids : [];
  deleteImageIds.forEach((imageId) => {
    if (imageId) {
      formData.append("delete_image_ids", String(imageId));
    }
  });

  return formData;
};

export const getMasterHotels = async (params = {}) => {
  try {
    const response = await adminApiClient.get(MASTER_HOTELS_ENDPOINT, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch master hotels." };
  }
};

export const createMasterHotel = async (payload) => {
  try {
    const response = await adminApiClient.post(
      MASTER_HOTELS_ENDPOINT,
      buildMasterHotelFormData(payload),
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create master hotel." };
  }
};

export const updateMasterHotel = async (payload) => {
  try {
    const response = await adminApiClient.put(
      MASTER_HOTELS_ENDPOINT,
      buildMasterHotelFormData(payload),
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update master hotel." };
  }
};

export const deleteMasterHotel = async (hotelId) => {
  try {
    const response = await adminApiClient.delete(MASTER_HOTELS_ENDPOINT, {
      data: { hotel_id: hotelId },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete master hotel." };
  }
};

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiImage,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Loader from "../../../components/loader";
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "../../../components/ui";
import SuperAdminModuleShell from "../../dashboard/components/SuperAdminModuleShell";
import {
  createMasterHotel,
  deleteMasterHotel,
  getMasterHotels,
  updateMasterHotel,
} from "../../../utility/masterHotelsApi";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const MAX_IMAGE_COUNT = 6;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const CITY_OPTIONS = [
  "Najaf",
  "Karbala",
  "Kadhimayn",
  "Samarra",
  "Baghdad",
  "Qom",
  "Mashhad",
];
const RATING_OPTIONS = ["3 Star", "4 Star", "5 Star"];
const ROOM_SHARING_OPTIONS = ["Single", "Double", "Triple", "Quad", "Family"];
const DISTANCE_TYPE_OPTIONS = ["Meters", "KM", "Minutes Walk"];

const createDefaultFormValues = () => ({
  hotel_city: "Najaf",
  hotel_name: "",
  hotel_rating: "5 Star",
  room_sharing_type: "Double",
  hotel_distance: "",
  distance_type: "KM",
});

const toFormValues = (hotel) => ({
  hotel_city: hotel.hotel_city || "Najaf",
  hotel_name: hotel.hotel_name || "",
  hotel_rating: hotel.hotel_rating || "5 Star",
  room_sharing_type: hotel.room_sharing_type || "Double",
  hotel_distance: hotel.hotel_distance || "",
  distance_type: hotel.distance_type || "KM",
});

const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }

  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith("blob:")) {
    return imagePath;
  }

  return `${API_BASE_URL}${imagePath}`;
};

const getHotelImages = (hotel) => {
  const images = Array.isArray(hotel?.images)
    ? hotel.images
    : Array.isArray(hotel?.hotel_images)
      ? hotel.hotel_images
      : [];

  return images
    .map((item, index) => ({
      image_id: String(item?.image_id || item?.id || `legacy-${hotel?.hotel_id}-${index}`),
      hotel_image: item?.hotel_image || item?.image || "",
    }))
    .filter((item) => item.hotel_image);
};

const formatDistance = (hotel) => {
  if (!hotel.hotel_distance) {
    return "N/A";
  }
  return `${hotel.hotel_distance} ${hotel.distance_type || ""}`.trim();
};

const HotelCatalog = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [formValues, setFormValues] = useState(createDefaultFormValues);
  const [editingHotelId, setEditingHotelId] = useState("");
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  const isEditMode = Boolean(editingHotelId);

  const loadHotels = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getMasterHotels(filters);
      setHotels(Array.isArray(data?.results) ? data.results : []);
    } catch (error) {
      setHotels([]);
      toast.error(error?.message || "Unable to fetch hotels catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      const params = {};
      const cleanedSearch = search.trim();
      if (cityFilter) {
        params.city = cityFilter;
      }
      if (cleanedSearch) {
        params.search = cleanedSearch;
      }
      loadHotels(params);
    }, 250);

    return () => clearTimeout(delayTimer);
  }, [cityFilter, loadHotels, search]);

  useEffect(
    () => () => {
      newImageFiles.forEach((fileItem) => {
        if (fileItem.previewUrl) {
          URL.revokeObjectURL(fileItem.previewUrl);
        }
      });
    },
    [newImageFiles]
  );

  const visibleHotels = useMemo(() => {
    if (!ratingFilter) {
      return hotels;
    }
    return hotels.filter((hotel) => hotel.hotel_rating === ratingFilter);
  }, [hotels, ratingFilter]);

  const activeEditingHotel = useMemo(
    () => hotels.find((hotel) => String(hotel.hotel_id) === String(editingHotelId)) || null,
    [editingHotelId, hotels]
  );

  const existingImages = useMemo(() => {
    if (!activeEditingHotel) {
      return [];
    }

    return getHotelImages(activeEditingHotel).filter(
      (image) => !deleteImageIds.includes(String(image.image_id))
    );
  }, [activeEditingHotel, deleteImageIds]);

  const currentImageCount = useMemo(
    () => existingImages.length + newImageFiles.length,
    [existingImages.length, newImageFiles.length]
  );

  const catalogStats = useMemo(() => {
    const cityCount = new Set(hotels.map((item) => item.hotel_city).filter(Boolean)).size;
    const imageCount = hotels.reduce((sum, item) => sum + getHotelImages(item).length, 0);

    return [
      { label: "Hotels Loaded", value: hotels.length },
      { label: "Cities Covered", value: cityCount },
      { label: "Images Uploaded", value: imageCount },
    ];
  }, [hotels]);

  const clearSelectedNewImages = useCallback(() => {
    setNewImageFiles((prev) => {
      prev.forEach((fileItem) => {
        if (fileItem.previewUrl) {
          URL.revokeObjectURL(fileItem.previewUrl);
        }
      });
      return [];
    });
  }, []);

  const resetForm = useCallback(() => {
    setEditingHotelId("");
    setFormValues(createDefaultFormValues());
    setDeleteImageIds([]);
    clearSelectedNewImages();
  }, [clearSelectedNewImages]);

  const clearFilters = () => {
    setSearch("");
    setCityFilter("");
    setRatingFilter("");
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelection = (event) => {
    const pickedFiles = Array.from(event.target.files || []);
    event.target.value = "";

    if (!pickedFiles.length) {
      return;
    }

    const validFiles = [];
    for (const file of pickedFiles) {
      if (!String(file.type || "").startsWith("image/")) {
        toast.error(`"${file.name}" is not a valid image file.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`"${file.name}" exceeds the 5 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) {
      return;
    }

    const remainingSlots = MAX_IMAGE_COUNT - currentImageCount;
    if (remainingSlots <= 0) {
      toast.error(`Only ${MAX_IMAGE_COUNT} images are allowed per hotel.`);
      return;
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);
    if (filesToAdd.length < validFiles.length) {
      toast.warn(`Only ${remainingSlots} more image(s) can be added.`);
    }

    const prepared = filesToAdd.map((file) => ({
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      size: file.size,
    }));

    setNewImageFiles((prev) => [...prev, ...prepared]);
  };

  const handleRemoveNewImage = (imageIndex) => {
    setNewImageFiles((prev) => {
      const target = prev[imageIndex];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, index) => index !== imageIndex);
    });
  };

  const handleRemoveExistingImage = (imageId) => {
    const normalizedId = String(imageId || "").trim();
    if (!normalizedId) {
      return;
    }

    setDeleteImageIds((prev) => {
      if (prev.includes(normalizedId)) {
        return prev;
      }
      return [...prev, normalizedId];
    });
  };

  const validateForm = () => {
    if (!formValues.hotel_city || !formValues.hotel_name.trim()) {
      toast.error("City and hotel name are required.");
      return false;
    }
    if (!formValues.hotel_rating || !formValues.room_sharing_type) {
      toast.error("Hotel rating and room sharing type are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || submitting) {
      return;
    }

    const payload = {
      ...formValues,
      hotel_name: formValues.hotel_name.trim(),
      hotel_distance: formValues.hotel_distance?.trim() || "",
      images: newImageFiles.map((fileItem) => fileItem.file),
      delete_image_ids: deleteImageIds,
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateMasterHotel({ ...payload, hotel_id: editingHotelId });
        toast.success("Hotel updated in catalog.");
      } else {
        await createMasterHotel(payload);
        toast.success("Hotel added to catalog.");
      }

      resetForm();
      const params = {};
      if (cityFilter) {
        params.city = cityFilter;
      }
      if (search.trim()) {
        params.search = search.trim();
      }
      await loadHotels(params);
    } catch (error) {
      toast.error(error?.message || "Failed to save hotel.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (hotel) => {
    setEditingHotelId(hotel.hotel_id);
    setFormValues(toFormValues(hotel));
    setDeleteImageIds([]);
    clearSelectedNewImages();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (hotelId, hotelName) => {
    if (!hotelId || submitting) {
      return;
    }
    const confirmed = window.confirm(`Delete "${hotelName}" from hotel catalog?`);
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteMasterHotel(hotelId);
      if (editingHotelId === hotelId) {
        resetForm();
      }
      setHotels((prev) => prev.filter((item) => item.hotel_id !== hotelId));
      toast.success("Hotel deleted from catalog.");
    } catch (error) {
      toast.error(error?.message || "Failed to delete hotel.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SuperAdminModuleShell
      title="Hotel Catalog"
      subtitle="Manage reusable hotel templates used in partner package creation."
      showBackButton={false}
    >
      <div className="app-content-stack">
        <AppCard
          className="relative overflow-hidden border-0 text-white shadow-custom-shadow"
          style={{
            background:
              "linear-gradient(118deg, rgba(7,82,65,0.98) 0%, rgba(10,143,103,0.96) 48%, rgba(12,109,134,0.95) 100%)",
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-14 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-16 h-40 w-40 rounded-full bg-brand-100/20 blur-2xl" />

          <div className="relative space-y-5">
            <AppSectionHeader
              title="Master Hotels"
              subtitle="Maintain premium templates so package setup stays fast and consistent across cities."
              titleClassName="!text-white"
              subtitleClassName="!text-white/90"
              action={
                <AppButton
                  variant="ghost"
                  size="sm"
                  className="!bg-white !text-brand-700 border-white/90"
                  startIcon={<FiPlus className="h-4 w-4" />}
                  onClick={resetForm}
                >
                  Add Hotel
                </AppButton>
              }
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {catalogStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
                    {item.label}
                  </p>
                  <p className="mt-1 font-k2d text-2xl font-semibold leading-none">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </AppCard>

        <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
          <AppCard className="relative overflow-hidden border-slate-200/80">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-500 via-emerald-500 to-cyan-600" />

            <div className="space-y-4 pt-1">
              <AppSectionHeader
                title={isEditMode ? "Edit Hotel Template" : "Create Hotel Template"}
                subtitle={
                  isEditMode
                    ? "Update catalog values and save changes."
                    : "Add a reusable hotel template for package creation."
                }
                action={
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                      isEditMode
                        ? "bg-amber-100 text-amber-700"
                        : "bg-brand-100 text-brand-700"
                    }`}
                  >
                    {isEditMode ? "Editing" : "New Entry"}
                  </span>
                }
              />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      City
                    </label>
                    <select
                      name="hotel_city"
                      value={formValues.hotel_city}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2.5 text-sm"
                    >
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      name="hotel_name"
                      value={formValues.hotel_name}
                      onChange={handleFieldChange}
                      placeholder="e.g. Shabestan Najaf"
                      className="w-full px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                        Rating
                      </label>
                      <select
                        name="hotel_rating"
                        value={formValues.hotel_rating}
                        onChange={handleFieldChange}
                        className="w-full px-3 py-2.5 text-sm"
                      >
                        {RATING_OPTIONS.map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                        Sharing Type
                      </label>
                      <select
                        name="room_sharing_type"
                        value={formValues.room_sharing_type}
                        onChange={handleFieldChange}
                        className="w-full px-3 py-2.5 text-sm"
                      >
                        {ROOM_SHARING_OPTIONS.map((sharing) => (
                          <option key={sharing} value={sharing}>
                            {sharing}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                        Distance
                      </label>
                      <input
                        type="text"
                        name="hotel_distance"
                        value={formValues.hotel_distance}
                        onChange={handleFieldChange}
                        placeholder="e.g. 450"
                        className="w-full px-3 py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                        Distance Unit
                      </label>
                      <select
                        name="distance_type"
                        value={formValues.distance_type}
                        onChange={handleFieldChange}
                        className="w-full px-3 py-2.5 text-sm"
                      >
                        {DISTANCE_TYPE_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                      Hotel Images
                    </p>
                    <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                      {currentImageCount}/{MAX_IMAGE_COUNT}
                    </span>
                  </div>

                  <label className="mb-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:text-brand-700">
                    <FiImage className="h-4 w-4" />
                    <span>Add Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelection}
                    />
                  </label>
                  <p className="text-[11px] text-ink-500">
                    Upload up to {MAX_IMAGE_COUNT} images. Each image must be 5 MB or smaller.
                  </p>

                  {deleteImageIds.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setDeleteImageIds([])}
                      className="mt-2 text-[11px] font-semibold text-brand-700"
                    >
                      Undo removed images ({deleteImageIds.length})
                    </button>
                  ) : null}

                  {existingImages.length ? (
                    <div className="mt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                        Existing
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((image) => (
                          <div key={image.image_id} className="relative overflow-hidden rounded-lg border border-slate-200">
                            <img
                              src={resolveImageUrl(image.hotel_image)}
                              alt="Hotel"
                              className="h-16 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(image.image_id)}
                              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                              aria-label="Remove existing image"
                            >
                              <FiX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {newImageFiles.length ? (
                    <div className="mt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">New</p>
                      <div className="grid grid-cols-3 gap-2">
                        {newImageFiles.map((fileItem, index) => (
                          <div key={`${fileItem.name}-${index}`} className="relative overflow-hidden rounded-lg border border-slate-200">
                            <img
                              src={fileItem.previewUrl}
                              alt={fileItem.name}
                              className="h-16 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(index)}
                              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                              aria-label="Remove new image"
                            >
                              <FiX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <AppButton
                    type="submit"
                    size="sm"
                    loading={submitting}
                    loadingLabel="Saving..."
                    startIcon={isEditMode ? <FiEdit2 className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
                  >
                    {isEditMode ? "Update Hotel" : "Create Hotel"}
                  </AppButton>
                  {isEditMode ? (
                    <AppButton type="button" variant="outline" size="sm" onClick={resetForm}>
                      Cancel Edit
                    </AppButton>
                  ) : null}
                </div>
              </form>
            </div>
          </AppCard>

          <AppCard className="border-slate-200/90">
            <AppSectionHeader
              title="Catalog Library"
              subtitle="Find templates by city or category and keep your hotel data clean."
              action={
                <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-[11px] font-semibold text-brand-700">
                  {visibleHotels.length} shown
                </span>
              }
            />

            <div className="mb-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 sm:p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <label className="relative block">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by city or hotel name..."
                    className="w-full py-2.5 pl-9 pr-10 text-sm"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 transition hover:bg-slate-100 hover:text-ink-700"
                      aria-label="Clear search"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  ) : null}
                </label>

                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!search && !cityFilter && !ratingFilter}
                >
                  Clear Filters
                </AppButton>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">City</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ value: "", label: "All Cities" }, ...CITY_OPTIONS.map((item) => ({ value: item, label: item }))].map(
                      (item) => {
                        const isActive = cityFilter === item.value;

                        return (
                          <button
                            key={item.value || "all-cities"}
                            type="button"
                            onClick={() => setCityFilter(item.value)}
                            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? "bg-gradient-to-r from-brand-500 to-cyan-600 text-white shadow-[0_8px_16px_rgba(10,143,103,0.26)]"
                                : "border border-slate-200 bg-white text-ink-600 hover:border-brand-200 hover:text-brand-700"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">Rating</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ value: "", label: "All Ratings" }, ...RATING_OPTIONS.map((item) => ({ value: item, label: item }))].map(
                      (item) => {
                        const isActive = ratingFilter === item.value;

                        return (
                          <button
                            key={item.value || "all-ratings"}
                            type="button"
                            onClick={() => setRatingFilter(item.value)}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              isActive
                                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-300"
                                : "border border-slate-200 bg-white text-ink-600 hover:border-amber-200 hover:text-amber-700"
                            }`}
                          >
                            <FiStar className="h-3.5 w-3.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Loader />
              </div>
            ) : visibleHotels.length === 0 ? (
              <AppEmptyState
                icon={<FiMapPin className="h-6 w-6" />}
                title="No hotels found"
                message="Create a new template or adjust filters to view matching hotels."
                action={
                  search || cityFilter || ratingFilter ? (
                    <AppButton type="button" variant="outline" size="sm" onClick={clearFilters}>
                      Reset Filters
                    </AppButton>
                  ) : null
                }
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-ink-500">
                      <tr>
                        <th className="px-3 py-2.5">City</th>
                        <th className="px-3 py-2.5">Hotel</th>
                        <th className="px-3 py-2.5">Rating</th>
                        <th className="px-3 py-2.5">Sharing</th>
                        <th className="px-3 py-2.5">Distance</th>
                        <th className="px-3 py-2.5">Images</th>
                        <th className="px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleHotels.map((hotel, index) => {
                        const hotelImages = getHotelImages(hotel);
                        const firstImage = hotelImages[0]?.hotel_image;

                        return (
                          <tr
                            key={hotel.hotel_id}
                            className={`border-t border-slate-100 ${index % 2 ? "bg-slate-50/35" : "bg-white"}`}
                          >
                            <td className="px-3 py-2.5">
                              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                                {hotel.hotel_city}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-ink-900">{hotel.hotel_name}</td>
                            <td className="px-3 py-2.5 text-ink-700">{hotel.hotel_rating}</td>
                            <td className="px-3 py-2.5 text-ink-700">{hotel.room_sharing_type}</td>
                            <td className="px-3 py-2.5 text-ink-700">{formatDistance(hotel)}</td>
                            <td className="px-3 py-2.5 text-ink-700">
                              <div className="flex items-center gap-2">
                                {firstImage ? (
                                  <img
                                    src={resolveImageUrl(firstImage)}
                                    alt={hotel.hotel_name}
                                    className="h-8 w-8 rounded-md border border-slate-200 object-cover"
                                  />
                                ) : (
                                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400">
                                    <FiImage className="h-4 w-4" />
                                  </span>
                                )}
                                <span className="text-xs font-semibold">{hotelImages.length}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(hotel)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                                  aria-label={`Edit ${hotel.hotel_name}`}
                                >
                                  <FiEdit2 className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(hotel.hotel_id, hotel.hotel_name)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                                  aria-label={`Delete ${hotel.hotel_name}`}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:hidden">
                  {visibleHotels.map((hotel) => {
                    const hotelImages = getHotelImages(hotel);

                    return (
                      <article
                        key={hotel.hotel_id}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-custom-shadow1"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-ink-900">{hotel.hotel_name}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-1 font-semibold text-brand-700">
                                {hotel.hotel_city}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800">
                                <FiStar className="h-3 w-3" />
                                {hotel.hotel_rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                            <p className="text-ink-400">Sharing</p>
                            <p className="mt-0.5 font-semibold text-ink-700">{hotel.room_sharing_type}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                            <p className="text-ink-400">Distance</p>
                            <p className="mt-0.5 font-semibold text-ink-700">{formatDistance(hotel)}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                            <p className="text-ink-400">Images</p>
                            <p className="mt-0.5 font-semibold text-ink-700">{hotelImages.length}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditClick(hotel)}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(hotel.hotel_id, hotel.hotel_name)}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-ink-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </AppCard>
        </div>
      </div>
    </SuperAdminModuleShell>
  );
};

export default HotelCatalog;

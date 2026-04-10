import {
  normalizeWorkflowBucket as normalizeSharedWorkflowBucket,
  resolveBackendActionFlags,
  resolveFulfillmentSummary,
  resolveWorkflowBucket,
} from "../shared/bookingWorkflowContract.js";

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

const toString = (value) => String(value || "").trim();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return Boolean(value);
};

const toTitleLabel = (value) =>
  toString(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const normalizeCityKey = (value = "") =>
  toString(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace("kadhmain", "kadhimayn")
    .replace("kadhemain", "kadhimayn")
    .replace("kazmain", "kadhimayn")
    .replace("kadhmain", "kadhimayn");

const normalizeAdminWorkflowBucket = (value) => {
  const normalized = toString(value).toUpperCase();
  if (normalized === "REPORTED") {
    return "ISSUES";
  }

  return normalizeSharedWorkflowBucket(value);
};

export const resolveAdminAssetHref = (value = "") => {
  const normalized = toString(value);
  const baseUrl = `${process.env.REACT_APP_API_BASE_URL || ""}`.trim().replace(/\/$/, "");
  if (!normalized) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(normalized) || normalized.startsWith("//")) {
    return normalized;
  }

  let path = normalized;
  if (!path.startsWith("/")) {
    path = path.startsWith("media/") ? `/${path}` : `/media/${path}`;
  }

  return baseUrl ? `${baseUrl}${path}` : path;
};

const buildTravelerName = (traveler = {}, fallback = "Traveler") => {
  const fullName = [
    toString(traveler?.first_name),
    toString(traveler?.middle_name),
    toString(traveler?.last_name),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || fallback;
};

const normalizeTravelerIssue = (issue = {}, index = 0) => {
  const status = toString(issue?.status).toLowerCase() || "open";

  return {
    id: toString(issue?.traveler_issue_id) || `traveler-issue-${index + 1}`,
    travelerId: toString(issue?.traveler_id),
    travelerName: toString(issue?.traveler_name),
    groupId: toString(issue?.booking_group_id),
    groupLabel: toString(issue?.booking_group_label),
    issueType: toString(issue?.issue_type).toLowerCase() || "reported",
    notes: toString(issue?.notes),
    status,
    isOpen: status === "open",
    createdAt: issue?.created_at || "",
    resolvedAt: issue?.resolved_at || "",
    raw: issue,
  };
};

const buildIssueLookup = (issues = []) =>
  issues.reduce((lookup, issue) => {
    if (!issue?.travelerId) {
      return lookup;
    }

    return {
      ...lookup,
      [issue.travelerId]: [...(lookup[issue.travelerId] || []), issue],
    };
  }, {});

const normalizeTraveler = (traveler = {}, index = 0, issuesByTravelerId = {}) => {
  const id =
    toString(traveler?.passport_id) ||
    toString(traveler?.traveller_id) ||
    `traveler-${index + 1}`;
  const issues = issuesByTravelerId[id] || [];

  return {
    id,
    fullName: buildTravelerName(traveler, `Traveler ${index + 1}`),
    firstName: toString(traveler?.first_name),
    middleName: toString(traveler?.middle_name),
    lastName: toString(traveler?.last_name),
    travelerType: toString(traveler?.traveler_type || traveler?.traveller_type),
    roomType: toString(traveler?.room_type),
    travelerSequence: toNumber(
      traveler?.traveler_sequence || traveler?.traveller_sequence,
      index + 1
    ),
    groupId: toString(traveler?.booking_group_id),
    groupLabel: toString(traveler?.booking_group_label),
    passportNumber: toString(traveler?.passport_number),
    passportCountry: toString(traveler?.passport_country),
    dateOfBirth: traveler?.date_of_birth || "",
    expiryDate: traveler?.expiry_date || "",
    passportUrl: resolveAdminAssetHref(traveler?.user_passport),
    photoUrl: resolveAdminAssetHref(traveler?.user_photo),
    hasPassport: Boolean(traveler?.user_passport),
    hasPhoto: Boolean(traveler?.user_photo),
    issues,
    openIssues: issues.filter((issue) => issue.isOpen),
    isReported: issues.some((issue) => issue.isOpen),
    raw: traveler,
  };
};

const buildTravelerGroups = (groups = [], issuesByTravelerId = {}) =>
  (Array.isArray(groups) ? groups : []).map((group, groupIndex) => ({
    id: toString(group?.group_id) || `group-${groupIndex + 1}`,
    label: toString(group?.label) || `Group ${groupIndex + 1}`,
    sequence: toNumber(group?.sequence, groupIndex + 1),
    notes: toString(group?.notes),
    travelers: (Array.isArray(group?.travelers) ? group.travelers : []).map(
      (traveler, travelerIndex) =>
        normalizeTraveler(
          {
            ...traveler,
            booking_group_id: traveler?.booking_group_id ?? group?.group_id,
            booking_group_label: traveler?.booking_group_label ?? group?.label,
          },
          travelerIndex,
          issuesByTravelerId
        )
    ),
    raw: group,
  }));

const normalizeDocument = (document = {}, index = 0, { groupMap = {}, travelerMap = {} } = {}) => {
  const scope = toString(document?.document_scope || "booking").toLowerCase() || "booking";
  const groupId = toString(document?.booking_group_id);
  const travelerId = toString(document?.traveler_id);
  const traveler = travelerMap[travelerId] || null;
  const group =
    groupMap[groupId] ||
    (traveler?.groupId ? groupMap[traveler.groupId] : null);
  const href = resolveAdminAssetHref(document?.document_link);
  const fileName = decodeURIComponent(href.split("/").pop() || "").trim();

  return {
    id: toString(document?.document_id) || `document-${index + 1}`,
    category: toString(document?.document_category || document?.document_for).toLowerCase(),
    scope,
    title: toString(document?.document_title) || fileName || `Document ${index + 1}`,
    href,
    groupId,
    groupLabel: group?.label || toString(document?.booking_group_label),
    travelerId,
    travelerName: traveler?.fullName || toString(document?.traveler_name),
    ownerLabel:
      scope === "traveler"
        ? traveler?.fullName || "Traveler document"
        : scope === "group"
        ? group?.label || "Group document"
        : "Booking document",
    raw: document,
  };
};

const groupDocumentsByCategory = (documents = []) =>
  documents.reduce((groups, document) => {
    const key = document.category || "other";
    return {
      ...groups,
      [key]: [...(groups[key] || []), document],
    };
  }, {});

const normalizePackageHotel = (hotel = {}, index = 0) => ({
  id: toString(hotel?.hotel_id) || `package-hotel-${index + 1}`,
  city: toString(hotel?.hotel_city),
  cityKey: normalizeCityKey(hotel?.hotel_city),
  hotelName: toString(hotel?.hotel_name),
  rating: toString(hotel?.hotel_rating),
  distance: [toString(hotel?.hotel_distance), toString(hotel?.distance_type)]
    .filter(Boolean)
    .join(" "),
  raw: hotel,
});

const normalizeHotelFulfillment = (hotel = {}, index = 0) => ({
  id: toString(hotel?.fulfillment_id) || `hotel-fulfillment-${index + 1}`,
  city: toTitleLabel(hotel?.city || ""),
  cityKey: normalizeCityKey(hotel?.city),
  hotelName: toString(hotel?.hotel_name),
  contactName: toString(hotel?.contact_name),
  contactPhone: toString(hotel?.contact_phone),
  note: toString(hotel?.note),
  packageHotelId: toString(hotel?.package_hotel_id),
  sharedTime: hotel?.shared_time || "",
  hasSharedDetails: [
    toString(hotel?.hotel_name),
    toString(hotel?.contact_name),
    toString(hotel?.contact_phone),
    toString(hotel?.note),
  ].some(Boolean),
  raw: hotel,
});

const buildHotelCards = (packageHotels = [], hotelFulfillments = []) => {
  const cardMap = new Map();

  packageHotels.forEach((hotel) => {
    const key = hotel.id || hotel.cityKey;
    cardMap.set(key, {
      id: key,
      cityKey: hotel.cityKey,
      cityLabel: hotel.city || toTitleLabel(hotel.cityKey),
      packageHotel: hotel,
      confirmed: null,
    });
  });

  hotelFulfillments.forEach((hotel) => {
    const key = hotel.packageHotelId || hotel.cityKey || hotel.id;
    const current = cardMap.get(key) || {
      id: key,
      cityKey: hotel.cityKey,
      cityLabel: hotel.city || toTitleLabel(hotel.cityKey),
      packageHotel: null,
      confirmed: null,
    };

    cardMap.set(key, {
      ...current,
      cityKey: hotel.cityKey || current.cityKey,
      cityLabel: hotel.city || current.cityLabel,
      confirmed: hotel.hasSharedDetails ? hotel : null,
    });
  });

  return [...cardMap.values()].sort((left, right) =>
    left.cityLabel.localeCompare(right.cityLabel)
  );
};

const normalizeAirlineDirection = (value = "") => {
  const normalized = toString(value).toLowerCase();
  return ["return", "inbound", "back"].includes(normalized) ? "return" : "outbound";
};

const buildPackageAirlineSegments = (items = []) =>
  (Array.isArray(items) ? items : items ? [items] : []).flatMap((item, index) => {
    const outbound =
      item?.flight_from || item?.flight_to
        ? [
            {
              id: toString(item?.airline_id) || `package-airline-outbound-${index + 1}`,
              direction: "outbound",
              airlineName: toString(item?.airline_name),
              ticketType: toString(item?.ticket_type),
              flightFrom: toString(item?.flight_from),
              flightTo: toString(item?.flight_to),
            },
          ]
        : [];
    const inbound =
      item?.return_flight_from ||
      item?.return_flight_to ||
      item?.is_return_flight_included
        ? [
            {
              id: `${toString(item?.airline_id) || `package-airline-${index + 1}`}-return`,
              direction: "return",
              airlineName: toString(item?.airline_name),
              ticketType: toString(item?.ticket_type),
              flightFrom: toString(item?.return_flight_from),
              flightTo: toString(item?.return_flight_to),
            },
          ]
        : [];

    return [...outbound, ...inbound];
  });

const normalizeConfirmedAirline = (flight = {}, index = 0) => ({
  id: toString(flight?.booking_airline_id) || `airline-${index + 1}`,
  direction: normalizeAirlineDirection(flight?.flight_direction),
  flightDate: flight?.flight_date || "",
  flightTime: toString(flight?.flight_time),
  flightFrom: toString(flight?.flight_from),
  flightTo: toString(flight?.flight_to),
  raw: flight,
});

const buildAirlineCards = (packageSegments = [], confirmedSegments = []) =>
  ["outbound", "return"]
    .map((direction, index) => {
      const packageDefault = packageSegments.find((segment) => segment.direction === direction);
      const confirmed = confirmedSegments.find((segment) => segment.direction === direction);
      if (!packageDefault && !confirmed) {
        return null;
      }

      return {
        id: confirmed?.id || packageDefault?.id || `${direction}-${index + 1}`,
        direction,
        label: direction === "return" ? "Return flight" : "Outbound flight",
        packageDefault: packageDefault || null,
        confirmed: confirmed || null,
      };
    })
    .filter(Boolean);

const TRANSPORT_ROUTE_LABELS = {
  NAJAF: "Najaf",
  KARBALA: "Karbala",
  KADHIMAYN: "Kadhimayn",
  SAMARRA: "Samarra",
  BAGHDAD: "Baghdad",
  QOM: "Qom",
  MASHHAD: "Mashhad",
};

const formatTransportRoutes = (value = "") =>
  toString(value)
    .split(",")
    .map((segment) =>
      segment
        .split("_")
        .map(
          (part) => TRANSPORT_ROUTE_LABELS[toString(part).toUpperCase()] || toTitleLabel(part)
        )
        .filter(Boolean)
        .join(" -> ")
    )
    .filter(Boolean);

const normalizePackageTransport = (transport = {}) => ({
  transportName: toString(transport?.transport_name),
  transportType: toString(transport?.transport_type),
  routes: toString(transport?.routes),
  routeLabels: formatTransportRoutes(transport?.routes),
  raw: transport,
});

const normalizeTransportFulfillment = (transport = {}, documents = []) => {
  if (!transport || typeof transport !== "object") {
    return {
      id: "",
      mode: "none",
      transportName: "",
      transportType: "",
      routeSummary: "",
      routeLabels: [],
      contactName: "",
      contactPhone: "",
      ticketReference: "",
      note: "",
      sharedTime: "",
      documents,
      hasDetailsContent: false,
      hasTicketContent: documents.length > 0,
      shareMode: documents.length > 0 ? "ticket_only" : "none",
      hasAnyContent: documents.length > 0,
      raw: null,
    };
  }

  const hasDetailsContent = [
    "transport_name",
    "transport_type",
    "route_summary",
    "contact_name",
    "contact_phone",
  ].some((field) => Boolean(toString(transport?.[field])));
  const hasTicketContent =
    Boolean(toString(transport?.ticket_reference)) || documents.length > 0;
  const shareMode = hasDetailsContent && hasTicketContent
    ? "details_and_ticket"
    : hasTicketContent
    ? "ticket_only"
    : hasDetailsContent
    ? "details_only"
    : toString(transport?.transport_mode).toLowerCase() || "none";

  return {
    id: toString(transport?.transport_fulfillment_id),
    mode: toString(transport?.transport_mode).toLowerCase() || "none",
    transportName: toString(transport?.transport_name),
    transportType: toString(transport?.transport_type),
    routeSummary: toString(transport?.route_summary),
    routeLabels: formatTransportRoutes(transport?.route_summary),
    contactName: toString(transport?.contact_name),
    contactPhone: toString(transport?.contact_phone),
    ticketReference: toString(transport?.ticket_reference),
    note: toString(transport?.note),
    sharedTime: transport?.shared_time || "",
    documents,
    hasDetailsContent,
    hasTicketContent,
    shareMode,
    hasAnyContent: hasDetailsContent || hasTicketContent || Boolean(toString(transport?.note)),
    raw: transport,
  };
};

export const adaptAdminBooking = (booking = {}) => {
  if (!booking || typeof booking !== "object") {
    return booking;
  }

  const packageDefaults = booking?.package_defaults || {};
  const bookingFulfillment = booking?.booking_fulfillment || {};
  const travelerIssues = (Array.isArray(booking?.traveler_issues) ? booking.traveler_issues : [])
    .map(normalizeTravelerIssue);
  const issuesByTravelerId = buildIssueLookup(travelerIssues);

  const groupedTravelers = buildTravelerGroups(booking?.traveler_groups, issuesByTravelerId);
  const travelerGroups = groupedTravelers;
  const travelers = travelerGroups.flatMap((group) => group.travelers);
  const travelerMap = travelers.reduce(
    (lookup, traveler) => ({
      ...lookup,
      [traveler.id]: traveler,
    }),
    {}
  );
  const groupMap = travelerGroups.reduce(
    (lookup, group) => ({
      ...lookup,
      [group.id]: group,
    }),
    {}
  );

  const documentsSource = Array.isArray(bookingFulfillment?.documents)
    ? bookingFulfillment.documents
    : Array.isArray(booking?.booking_documents)
    ? booking.booking_documents
    : [];
  const documents = documentsSource
    .map((document, index) => normalizeDocument(document, index, { groupMap, travelerMap }))
    .filter((document) => document.href);
  const documentsByCategory = groupDocumentsByCategory(documents);

  const packageHotels = (Array.isArray(packageDefaults?.hotels)
    ? packageDefaults.hotels
    : []
  ).map(normalizePackageHotel);
  const hotelCards = buildHotelCards(
    packageHotels,
    (Array.isArray(bookingFulfillment?.hotels) ? bookingFulfillment.hotels : []).map(
      normalizeHotelFulfillment
    )
  );
  const packageAirlineSegments = buildPackageAirlineSegments(
    Array.isArray(packageDefaults?.airlines)
      ? packageDefaults.airlines
      : []
  );
  const confirmedAirlines = (Array.isArray(bookingFulfillment?.airlines)
    ? bookingFulfillment.airlines
    : Array.isArray(booking?.booking_airline_details)
    ? booking.booking_airline_details
    : []
  ).map(normalizeConfirmedAirline);
  const airlineCards = buildAirlineCards(packageAirlineSegments, confirmedAirlines);
  const packageTransport = packageDefaults?.transport
    ? normalizePackageTransport(packageDefaults.transport)
    : null;
  const transport = normalizeTransportFulfillment(
    bookingFulfillment?.transport,
    documents.filter((document) => document.category === "transport")
  );
  const fulfillmentSummary = resolveFulfillmentSummary(booking);
  const actionFlags = resolveBackendActionFlags(booking);
  const workflowBucket =
    normalizeAdminWorkflowBucket(booking?.workflow_bucket) || resolveWorkflowBucket(booking);

  return {
    ...booking,
    workflow_bucket: workflowBucket,
    travelers,
    traveler_groups_normalized: travelerGroups,
    traveler_issues_normalized: travelerIssues,
    open_traveler_issues: travelerIssues.filter((issue) => issue.isOpen),
    reported_travelers: travelers.filter((traveler) => traveler.isReported),
    documents_normalized: documents,
    documents_by_category: documentsByCategory,
    hotel_cards: hotelCards,
    airline_cards: airlineCards,
    confirmed_airlines: confirmedAirlines,
    package_airline_segments: packageAirlineSegments,
    package_transport_view: packageTransport,
    transport_fulfillment_view: transport,
    fulfillment_summary: fulfillmentSummary,
    actions: {
      canTakeDecision: actionFlags.canTakeDecision,
      canEditFulfillment: actionFlags.canEditFulfillment,
      canManageTravelerIssues: actionFlags.canManageTravelerIssues,
      canCompleteBooking: actionFlags.canCompleteBooking,
    },
  };
};

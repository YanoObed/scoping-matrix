import type {
  Contact,
  WorkspaceMember,
} from "../types/crm";


export function optionalText(
  value: string,
) {
  return value.trim() || null;
}


export function memberName(
  member: WorkspaceMember,
) {
  return (
    [
      member.first_name,
      member.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    member.email
  );
}


export function contactName(
  contact: Pick<
    Contact,
    "first_name" | "last_name"
  >,
) {
  return [
    contact.first_name,
    contact.last_name,
  ]
    .filter(Boolean)
    .join(" ");
}


export function formatCurrency(
  value: string | number | null,
) {
  if (
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    },
  ).format(number);
}


export function formatDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
      ? new Date(
          `${value}T00:00:00`,
        )
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}


export function formatDateTime(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}


export function toInputDateTime(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const local = new Date(
    date.getTime() -
      date.getTimezoneOffset() *
        60_000,
  );

  return local
    .toISOString()
    .slice(0, 16);
}


export function toApiDateTime(
  value: string,
) {
  return value
    ? new Date(value).toISOString()
    : null;
}
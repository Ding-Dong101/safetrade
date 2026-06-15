import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (value?: string): string => {
    if (!value) return "Not provided";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("MMM DD, YYYY") : "Not provided";
};

export const formatDateTime = (value?: string): string => {
    if (!value) return "Not provided";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("MMM DD, YYYY • hh:mm A") : "Not provided";
};

export const formatRelativeTime = (value?: string): string => {
    if (!value) return "Not provided";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.fromNow() : "Not provided";
};
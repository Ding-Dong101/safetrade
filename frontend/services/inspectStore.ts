import { LinkPreviewData } from "./linkService";

let currentInspectionData: LinkPreviewData | null = null;

export const setInspectionData = (data: LinkPreviewData | null) => {
    currentInspectionData = data;
};

export const getInspectionData = (): LinkPreviewData | null => {
    return currentInspectionData;
};

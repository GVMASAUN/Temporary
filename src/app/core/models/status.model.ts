import { BadgeType } from "@visa/vds-angular";
import { VisaIcon } from "../constants";

export enum StatusCode {
  ACTIVE = 1,
  APPROVED,
  DRAFT,
  PENDING_REVIEW,
  PENDING_DEACTIVATION_REVIEW,
  REJECTED,
  DEACTIVATION_REJECTED,
  INACTIVE,
  ERROR,
  ARCHIVED,
  PENDING_APPROVAL,
  VALID,
  INVALID
}

export enum StatusDesc {
  ACTIVE = "Active",
  APPROVED = "Approved",
  ARCHIVED = 'Archived',
  DEACTIVATION_REJECTED = "Deactivation Request Rejected",
  DISABLED = "Disabled",
  DRAFT = "Draft",
  ERROR = "Error",
  INACTIVE = "Inactive",
  INVALID = 'Invalid',
  PENDING = 'Pending',
  PENDING_APPROVAL = 'Pending Approval',
  PENDING_DEACTIVATION_REVIEW = "Pending Deactivation Review",
  PENDING_REVIEW = "Pending Review",
  REJECT = "Rejected",
  VALID = 'Valid',
}


export const STATUS_DESC = {
  [StatusCode.ACTIVE]: StatusDesc.ACTIVE,
  [StatusCode.APPROVED]: StatusDesc.APPROVED,
  [StatusCode.DEACTIVATION_REJECTED]: StatusDesc.DEACTIVATION_REJECTED,
  [StatusCode.DRAFT]: StatusDesc.DRAFT,
  [StatusCode.ERROR]: StatusDesc.ERROR,
  [StatusCode.INACTIVE]: StatusDesc.INACTIVE,
  [StatusCode.PENDING_DEACTIVATION_REVIEW]: StatusDesc.PENDING_DEACTIVATION_REVIEW,
  [StatusCode.PENDING_REVIEW]: StatusDesc.PENDING_REVIEW,
  [StatusCode.REJECTED]: StatusDesc.REJECT,
  [StatusCode.ARCHIVED]: StatusDesc.ARCHIVED,
  [StatusCode.PENDING_APPROVAL]: StatusDesc.PENDING_APPROVAL,
  [StatusCode.VALID]: StatusDesc.VALID,
  [StatusCode.INVALID]: StatusDesc.INVALID
};

export const STATUS_BADGE_TYPE = {
  [StatusCode.ACTIVE]: BadgeType.STABLE,
  [StatusCode.APPROVED]: BadgeType.STABLE,
  [StatusCode.DEACTIVATION_REJECTED]: BadgeType.CRITICAL,
  [StatusCode.DRAFT]: BadgeType.DISABLED,
  [StatusCode.ERROR]: BadgeType.CRITICAL,
  [StatusCode.INACTIVE]: BadgeType.NEUTRAL,
  [StatusCode.PENDING_DEACTIVATION_REVIEW]: BadgeType.CRITICAL,
  [StatusCode.PENDING_REVIEW]: BadgeType.ACCENT,
  [StatusCode.REJECTED]: BadgeType.WARNING,
  [StatusCode.ARCHIVED]: BadgeType.DISABLED,
  [StatusCode.PENDING_APPROVAL]: BadgeType.WARNING,
  [StatusCode.VALID]: BadgeType.STABLE,
  [StatusCode.INVALID]: BadgeType.CRITICAL,

};

export const STATUS_CODE_BY_STATUS = {
  [StatusCode[StatusCode.ACTIVE]]: StatusCode.ACTIVE,
  [StatusCode[StatusCode.APPROVED]]: StatusCode.APPROVED,
  [StatusCode[StatusCode.DEACTIVATION_REJECTED]]: StatusCode.DEACTIVATION_REJECTED,
  [StatusCode[StatusCode.DRAFT]]: StatusCode.DRAFT,
  [StatusCode[StatusCode.ERROR]]: StatusCode.ERROR,
  [StatusCode[StatusCode.INACTIVE]]: StatusCode.INACTIVE,
  [StatusCode[StatusCode.PENDING_DEACTIVATION_REVIEW]]: StatusCode.PENDING_DEACTIVATION_REVIEW,
  [StatusCode[StatusCode.PENDING_REVIEW]]: StatusCode.PENDING_REVIEW,
  [StatusCode[StatusCode.REJECTED]]: StatusCode.REJECTED,
  [StatusCode[StatusCode.ARCHIVED]]: StatusCode.ARCHIVED,
  [StatusCode[StatusCode.PENDING_APPROVAL]]: StatusCode.PENDING_APPROVAL
}

export const STATUS_ICON: { [key: number]: VisaIcon } = {
  [StatusCode.APPROVED]: VisaIcon.SUCCESS,
  [StatusCode.REJECTED]: VisaIcon.ERROR,
  [StatusCode.VALID]: VisaIcon.SUCCESS,
  [StatusCode.INVALID]: VisaIcon.ERROR
}

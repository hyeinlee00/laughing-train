export type Grade =
  | "견습생"
  | "초보 장인"
  | "붕어빵 장인"
  | "명장"
  | "전설의 붕어빵 장인";

export function getGrade(revenue: number): Grade {
  if (revenue < 3000) return "견습생";
  if (revenue < 5000) return "초보 장인";
  if (revenue < 7000) return "붕어빵 장인";
  if (revenue < 10000) return "명장";
  return "전설의 붕어빵 장인";
}

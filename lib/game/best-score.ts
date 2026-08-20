const STORAGE_KEY = "fish-bread-tycoon:best-score";

export function loadBestScore(): number {
  if (typeof window === "undefined") return 0;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveBestScoreIfHigher(score: number): number {
  const current = loadBestScore();
  if (score <= current) {
    return current;
  }

  window.localStorage.setItem(STORAGE_KEY, String(score));
  return score;
}

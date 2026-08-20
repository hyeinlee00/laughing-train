"use client";

type TrayProps = {
  trayKey: number;
  isActive: boolean;
  onActivate: (trayKey: number) => void;
};

export function Tray({ trayKey, isActive, onActivate }: TrayProps) {
  return (
    <button
      type="button"
      data-testid={`tray-${trayKey}`}
      data-tray-key={trayKey}
      data-active={isActive}
      onClick={() => onActivate(trayKey)}
      className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-border bg-muted text-foreground transition-transform data-[active=true]:scale-95 data-[active=true]:bg-accent"
    >
      <span className="text-xs text-muted-foreground">{trayKey}</span>
      <span className="text-sm">빈 틀</span>
    </button>
  );
}

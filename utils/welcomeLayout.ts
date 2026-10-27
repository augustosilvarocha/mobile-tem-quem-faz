type WelcomeFrame = {
  width: number;
  height: number;
  fontScale: number;
};

export function getWelcomeLayout({ width, height, fontScale }: WelcomeFrame) {
  const effectiveHeight = height / Math.max(1, fontScale);
  const tight = effectiveHeight < 500 || width < 330;
  const compact = tight || effectiveHeight < 740 || width < 360;
  const horizontalPadding = tight ? 12 : compact ? 16 : 20;
  const logoHeight = tight ? 52 : compact ? 88 : 140;

  return {
    horizontalPadding,
    gap: tight ? 4 : compact ? 6 : 8,
    logoHeight,
    logoWidth: Math.min(width - horizontalPadding * 2, logoHeight * (250 / 140)),
    illustrationMaxHeight: tight ? 120 : compact ? 200 : 250,
    subtitleFontSize: tight ? 15 : compact ? 18 : 20,
    subtitleLineHeight: tight ? 19 : compact ? 22 : 24,
    featureCircleSize: tight ? 30 : compact ? 40 : 54,
    featureIconSize: tight ? 18 : compact ? 24 : 32,
    featureTitleFontSize: tight ? 12 : compact ? 14 : 15,
    featureTitleLineHeight: tight ? 15 : compact ? 17 : 19,
    featureDescriptionFontSize: tight ? 11 : compact ? 12 : 13,
    featureDescriptionLineHeight: tight ? 14 : compact ? 16 : 18,
    buttonMinHeight: tight ? 44 : compact ? 50 : 62,
    buttonFontSize: tight ? 15 : compact ? 16 : 18,
    buttonLineHeight: tight ? 18 : compact ? 20 : 22,
    buttonIconSize: tight ? 22 : compact ? 24 : 28,
    registerLabelFontSize: tight ? 12 : compact ? 14 : 16,
    registerLabelLineHeight: tight ? 16 : compact ? 18 : 22,
    registerFontSize: tight ? 16 : compact ? 18 : 20,
    registerLineHeight: tight ? 20 : compact ? 22 : 24,
  };
}

export type WelcomeLayout = ReturnType<typeof getWelcomeLayout>;

// Color Contrast and Visual Accessibility Optimization
import React, { useState, useEffect, useCallback } from 'react';

// Color Contrast Interface
interface ColorContrastResult {
  ratio: number;
  levelAA: boolean;
  levelAAA: boolean;
  largeTextAA: boolean;
  largeTextAAA: boolean;
  recommendation?: string;
}

// Color Information Interface
interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  luminance: number;
}

// WCAG Contrast Requirements
const WCAG_CONTRAST_REQUIREMENTS = {
  AA: {
    normal: 4.5,
    large: 3.0
  },
  AAA: {
    normal: 7.0,
    large: 4.5
  }
};

// Color Contrast Utility Class
export class ColorContrastAnalyzer {
  // Convert hex to RGB
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Convert RGB to hex
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Calculate relative luminance
  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Calculate contrast ratio
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Analyze contrast compliance
  static analyzeContrast(foreground: string, background: string): ColorContrastResult {
    const ratio = this.getContrastRatio(foreground, background);
    
    return {
      ratio,
      levelAA: ratio >= WCAG_CONTRAST_REQUIREMENTS.AA.normal,
      levelAAA: ratio >= WCAG_CONTRAST_REQUIREMENTS.AAA.normal,
      largeTextAA: ratio >= WCAG_CONTRAST_REQUIREMENTS.AA.large,
      largeTextAAA: ratio >= WCAG_CONTRAST_REQUIREMENTS.AAA.large,
      recommendation: this.getContrastRecommendation(ratio)
    };
  }

  // Get contrast recommendation
  private static getContrastRecommendation(ratio: number): string {
    if (ratio >= 7) return "Excellent contrast - WCAG AAA compliant";
    if (ratio >= 4.5) return "Good contrast - WCAG AA compliant";
    if (ratio >= 3) return "Moderate contrast - WCAG AA compliant for large text only";
    return "Poor contrast - Does not meet WCAG standards";
  }

  // Find accessible color alternatives
  static findAccessibleAlternatives(
    foreground: string, 
    background: string, 
    targetLevel: 'AA' | 'AAA' = 'AA',
    textSize: 'normal' | 'large' = 'normal'
  ): { lighter: string; darker: string } {
    const targetRatio = WCAG_CONTRAST_REQUIREMENTS[targetLevel][textSize];
    const currentRatio = this.getContrastRatio(foreground, background);
    
    if (currentRatio >= targetRatio) {
      return { lighter: foreground, darker: foreground };
    }

    // Generate lighter and darker alternatives
    const lighter = this.adjustColorForContrast(foreground, background, targetRatio, 'lighter');
    const darker = this.adjustColorForContrast(foreground, background, targetRatio, 'darker');
    
    return { lighter, darker };
  }

  // Adjust color to meet contrast requirements
  private static adjustColorForContrast(
    color: string, 
    background: string, 
    targetRatio: number, 
    direction: 'lighter' | 'darker'
  ): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    let adjustedColor = color;
    let iterations = 0;
    const maxIterations = 20;

    while (iterations < maxIterations) {
      const currentRatio = this.getContrastRatio(adjustedColor, background);
      
      if (currentRatio >= targetRatio) {
        break;
      }

      // Adjust RGB values
      const adjustment = direction === 'lighter' ? 1.1 : 0.9;
      const newR = Math.min(255, Math.max(0, Math.round(rgb.r * adjustment)));
      const newG = Math.min(255, Math.max(0, Math.round(rgb.g * adjustment)));
      const newB = Math.min(255, Math.max(0, Math.round(rgb.b * adjustment)));
      
      adjustedColor = this.rgbToHex(newR, newG, newB);
      iterations++;
    }

    return adjustedColor;
  }

  // Get color information
  static getColorInfo(hex: string): ColorInfo | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const luminance = this.getLuminance(rgb.r, rgb.g, rgb.b);

    return {
      hex,
      rgb,
      hsl,
      luminance
    };
  }

  // Convert RGB to HSL
  private static rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  // Check if color is dark
  static isDarkColor(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;
    
    const luminance = this.getLuminance(rgb.r, rgb.g, rgb.b);
    return luminance < 0.5;
  }

  // Generate accessible color palette
  static generateAccessiblePalette(baseColor: string, backgroundColor: string): {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  } {
    const isDark = this.isDarkColor(backgroundColor);
    
    return {
      primary: this.findAccessibleAlternatives(baseColor, backgroundColor, 'AA', 'normal').darker,
      secondary: this.findAccessibleAlternatives('#6B7280', backgroundColor, 'AA', 'normal').darker,
      success: this.findAccessibleAlternatives('#10B981', backgroundColor, 'AA', 'normal').darker,
      warning: this.findAccessibleAlternatives('#F59E0B', backgroundColor, 'AA', 'normal').darker,
      error: this.findAccessibleAlternatives('#EF4444', backgroundColor, 'AA', 'normal').darker,
      info: this.findAccessibleAlternatives('#3B82F6', backgroundColor, 'AA', 'normal').darker
    };
  }
}

// Color Contrast React Hook
export const useColorContrast = (foreground: string, background: string) => {
  const [contrast, setContrast] = useState<ColorContrastResult | null>(null);
  const [colorInfo, setColorInfo] = useState<{ foreground: ColorInfo | null; background: ColorInfo | null }>({
    foreground: null,
    background: null
  });

  useEffect(() => {
    const result = ColorContrastAnalyzer.analyzeContrast(foreground, background);
    const fgInfo = ColorContrastAnalyzer.getColorInfo(foreground);
    const bgInfo = ColorContrastAnalyzer.getColorInfo(background);
    
    setContrast(result);
    setColorInfo({
      foreground: fgInfo,
      background: bgInfo
    });
  }, [foreground, background]);

  return {
    contrast,
    colorInfo,
    isAccessible: contrast?.levelAA || false,
    alternatives: contrast && !contrast.levelAA 
      ? ColorContrastAnalyzer.findAccessibleAlternatives(foreground, background)
      : null
  };
};

// Visual Accessibility Component
interface VisualAccessibilityProps {
  children: React.ReactNode;
  highContrastMode?: boolean;
  reducedMotion?: boolean;
  colorBlindMode?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

export const VisualAccessibilityProvider: React.FC<VisualAccessibilityProps> = ({
  children,
  highContrastMode = false,
  reducedMotion = false,
  colorBlindMode
}) => {
  const [styles, setStyles] = useState<React.CSSProperties>({});

  useEffect(() => {
    const newStyles: React.CSSProperties = {};

    if (highContrastMode) {
      newStyles.filter = 'contrast(1.5)';
      newStyles.backgroundColor = '#000';
      newStyles.color = '#fff';
    }

    if (reducedMotion) {
      newStyles.animation = 'none !important';
      newStyles.transition = 'none !important';
    }

    if (colorBlindMode) {
      switch (colorBlindMode) {
        case 'protanopia':
          newStyles.filter = 'url(#protanopia)';
          break;
        case 'deuteranopia':
          newStyles.filter = 'url(#deuteranopia)';
          break;
        case 'tritanopia':
          newStyles.filter = 'url(#tritanopia)';
          break;
        case 'achromatopsia':
          newStyles.filter = 'grayscale(100%)';
          break;
      }
    }

    setStyles(newStyles);
  }, [highContrastMode, reducedMotion, colorBlindMode]);

  return (
    <div style={styles}>
      {/* SVG filters for color blindness simulation */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0,     0, 0
                     0.558, 0.442, 0,     0, 0
                     0,     0.242, 0.758, 0, 0
                     0,     0,     0,     1, 0"
            />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0,   0, 0
                     0.7,   0.3,   0,   0, 0
                     0,     0.3,   0.7, 0, 0
                     0,     0,     0,   1, 0"
            />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05,  0,     0, 0
                     0,    0.433, 0.567, 0, 0
                     0,    0.475, 0.525, 0, 0
                     0,    0,     0,     1, 0"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
};

// Color Contrast Checker Component
interface ColorContrastCheckerProps {
  foregroundColor: string;
  backgroundColor: string;
  textSize?: 'normal' | 'large';
  showAlternatives?: boolean;
  onColorChange?: (colors: { foreground: string; background: string }) => void;
}

export const ColorContrastChecker: React.FC<ColorContrastCheckerProps> = ({
  foregroundColor,
  backgroundColor,
  textSize = 'normal',
  showAlternatives = true,
  onColorChange
}) => {
  const { contrast, colorInfo, isAccessible, alternatives } = useColorContrast(foregroundColor, backgroundColor);
  
  const [fgColor, setFgColor] = useState(foregroundColor);
  const [bgColor, setBgColor] = useState(backgroundColor);

  const handleForegroundChange = (color: string) => {
    setFgColor(color);
    onColorChange?.({ foreground: color, background: bgColor });
  };

  const handleBackgroundChange = (color: string) => {
    setBgColor(color);
    onColorChange?.({ foreground: fgColor, background: color });
  };

  if (!contrast) return null;

  return (
    <div className="color-contrast-checker" style={{ backgroundColor: bgColor, color: fgColor, padding: '20px', borderRadius: '8px' }}>
      <h3>Color Contrast Analysis</h3>
      
      <div className="contrast-results">
        <div className="contrast-ratio">
          <strong>Contrast Ratio:</strong> {contrast.ratio.toFixed(2)}:1
        </div>
        
        <div className="compliance-status">
          <div className={`status ${contrast.levelAA ? 'pass' : 'fail'}`}>
            WCAG AA {textSize === 'large' ? 'Large Text' : 'Normal Text'}: {contrast.levelAA ? '✓ Pass' : '✗ Fail'}
          </div>
          <div className={`status ${contrast.levelAAA ? 'pass' : 'fail'}`}>
            WCAG AAA {textSize === 'large' ? 'Large Text' : 'Normal Text'}: {contrast.levelAAA ? '✓ Pass' : '✗ Fail'}
          </div>
        </div>
        
        <div className="recommendation">
          <strong>Recommendation:</strong> {contrast.recommendation}
        </div>
      </div>

      {showAlternatives && alternatives && (
        <div className="alternatives">
          <h4>Accessible Alternatives:</h4>
          <div className="alternative-colors">
            <div className="alternative">
              <span>Lighter:</span>
              <div 
                className="color-swatch" 
                style={{ backgroundColor: alternatives.lighter, width: '40px', height: '40px', display: 'inline-block', marginLeft: '10px' }}
              />
              <span>{alternatives.lighter}</span>
            </div>
            <div className="alternative">
              <span>Darker:</span>
              <div 
                className="color-swatch" 
                style={{ backgroundColor: alternatives.darker, width: '40px', height: '40px', display: 'inline-block', marginLeft: '10px' }}
              />
              <span>{alternatives.darker}</span>
            </div>
          </div>
        </div>
      )}

      <div className="color-inputs">
        <div className="color-input-group">
          <label htmlFor="foreground-color">Foreground Color:</label>
          <input
            id="foreground-color"
            type="color"
            value={fgColor}
            onChange={(e) => handleForegroundChange(e.target.value)}
          />
          <input
            type="text"
            value={fgColor}
            onChange={(e) => handleForegroundChange(e.target.value)}
            placeholder="#000000"
          />
        </div>
        
        <div className="color-input-group">
          <label htmlFor="background-color">Background Color:</label>
          <input
            id="background-color"
            type="color"
            value={bgColor}
            onChange={(e) => handleBackgroundChange(e.target.value)}
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => handleBackgroundChange(e.target.value)}
            placeholder="#ffffff"
          />
        </div>
      </div>

      {colorInfo.foreground && colorInfo.background && (
        <div className="color-details">
          <h4>Color Details:</h4>
          <div className="color-info">
            <div>
              <strong>Foreground:</strong><br />
              RGB: {colorInfo.foreground.rgb.r}, {colorInfo.foreground.rgb.g}, {colorInfo.foreground.rgb.b}<br />
              HSL: {colorInfo.foreground.hsl.h}°, {colorInfo.foreground.hsl.s}%, {colorInfo.foreground.hsl.l}%<br />
              Luminance: {colorInfo.foreground.luminance.toFixed(4)}
            </div>
            <div>
              <strong>Background:</strong><br />
              RGB: {colorInfo.background.rgb.r}, {colorInfo.background.rgb.g}, {colorInfo.background.rgb.b}<br />
              HSL: {colorInfo.background.hsl.h}°, {colorInfo.background.hsl.s}%, {colorInfo.background.hsl.l}%<br />
              Luminance: {colorInfo.background.luminance.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      <div className="preview-text" style={{ fontSize: textSize === 'large' ? 'var(--text-2xl)' : 'var(--text-base)' }}>
        <p>This is sample text to test the color contrast.</p>
        <p style={{ fontWeight: 'bold' }}>This is bold text for additional testing.</p>
      </div>
    </div>
  );
};

// Focus Indicator Component
interface FocusIndicatorProps {
  color?: string;
  width?: number;
  offset?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'double';
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  color = '#0066cc',
  width = 3,
  offset = 2,
  style = 'solid'
}) => {
  const focusStyles = `
    .accessible-focus {
      outline: ${width}px ${style} ${color} !important;
      outline-offset: ${offset}px !important;
    }
    
    .accessible-focus:focus {
      outline: ${width}px ${style} ${color} !important;
      outline-offset: ${offset}px !important;
    }
    
    .accessible-focus:focus-visible {
      outline: ${width}px ${style} ${color} !important;
      outline-offset: ${offset}px !important;
    }
  `;

  return (
    <style>{focusStyles}</style>
  );
};

// Visual Accessibility Hook
export const useVisualAccessibility = () => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState<string>('');

  useEffect(() => {
    // Check for user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    setHighContrastMode(prev => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };

  const setColorBlindMode = (mode: string) => {
    setColorBlindMode(mode);
  };

  return {
    highContrastMode,
    reducedMotion,
    colorBlindMode,
    toggleHighContrast,
    toggleReducedMotion,
    setColorBlindMode
  };
};

// Color Palette Generator
export const generateAccessibleColorPalette = (baseColor: string): {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string;
  background: string;
  border: string;
} => {
  const baseLuminance = ColorContrastAnalyzer.getLuminance(
    ...Object.values(ColorContrastAnalyzer.hexToRgb(baseColor) || { r: 0, g: 0, b: 0 })
  );

  const isDarkBase = baseLuminance < 0.5;
  const textColor = isDarkBase ? '#ffffff' : '#000000';
  const backgroundColor = isDarkBase ? '#000000' : '#ffffff';

  return {
    primary: baseColor,
    secondary: ColorContrastAnalyzer.findAccessibleAlternatives('#6B7280', backgroundColor, 'AA', 'normal').darker,
    success: ColorContrastAnalyzer.findAccessibleAlternatives('#10B981', backgroundColor, 'AA', 'normal').darker,
    warning: ColorContrastAnalyzer.findAccessibleAlternatives('#F59E0B', backgroundColor, 'AA', 'normal').darker,
    error: ColorContrastAnalyzer.findAccessibleAlternatives('#EF4444', backgroundColor, 'AA', 'normal').darker,
    info: ColorContrastAnalyzer.findAccessibleAlternatives('#3B82F6', backgroundColor, 'AA', 'normal').darker,
    text: textColor,
    background: backgroundColor,
    border: ColorContrastAnalyzer.findAccessibleAlternatives('#E5E7EB', backgroundColor, 'AA', 'normal').darker
  };
};

export {
  ColorContrastAnalyzer,
  WCAG_CONTRAST_REQUIREMENTS,
  type ColorContrastResult,
  type ColorInfo
};

export default {
  ColorContrastAnalyzer,
  useColorContrast,
  ColorContrastChecker,
  FocusIndicator,
  useVisualAccessibility,
  generateAccessibleColorPalette,
  VisualAccessibilityProvider
};

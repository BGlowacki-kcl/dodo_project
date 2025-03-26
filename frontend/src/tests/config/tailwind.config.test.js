import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../../tailwind.config';

describe('Tailwind Configuration', () => {
  it('has the correct content paths', () => {
    expect(tailwindConfig.content).toEqual([
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ]);
  });
  
  it('contains required theme extensions', () => {
    const { extend } = tailwindConfig.theme;
    
    // Test for custom colors
    expect(extend.colors).toHaveProperty('secondary', '#1B2A41');
    expect(extend.colors).toHaveProperty('primary', '#ffffff');
    expect(extend.colors).toHaveProperty('background', '#e0e0e0');
    expect(extend.colors).toHaveProperty('ltext', '#ffffff');
    expect(extend.colors).toHaveProperty('dtext', '#000000');
    
    // Test for font families
    expect(extend.fontFamily).toHaveProperty('sans');
    expect(extend.fontFamily).toHaveProperty('heading');
    
    // Test for font sizes
    expect(extend.fontSize).toHaveProperty('fontSize');
  });
  
  it('has empty plugins array', () => {
    expect(tailwindConfig.plugins).toEqual([]);
  });
});

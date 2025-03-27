import { describe, it, expect } from 'vitest';
import postcssConfig from '../../../postcss.config';

describe('PostCSS Configuration', () => {
  it('exports the correct configuration object', () => {
    expect(postcssConfig).toHaveProperty('plugins');
    expect(postcssConfig.plugins).toBeTypeOf('object');
  });
  
  it('includes required plugins', () => {
    expect(postcssConfig.plugins).toHaveProperty('tailwindcss');
    expect(postcssConfig.plugins).toHaveProperty('autoprefixer');
  });
  
  it('has tailwindcss and autoprefixer configured', () => {
    expect(postcssConfig.plugins.tailwindcss).toEqual({});
    expect(postcssConfig.plugins.autoprefixer).toEqual({});
  });
});

import { describe, it, expect } from 'vitest';
import HomePage from '../src/app/page.js';

describe('Web Foundation - Root Page', () => {
  it('renders root page component without crashing', () => {
    const element = HomePage();
    expect(element).toBeDefined();
    expect(element.type).toBe('main');
  });
});

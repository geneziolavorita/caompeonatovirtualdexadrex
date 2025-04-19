// Server-side exports for the game room page

// Export generateStaticParams to enable static site generation for dynamic routes
// This is required when using 'output: export' in next.config.js to pre-render dynamic routes
// It generates a static version of the page at build time with the provided parameters
export function generateStaticParams() {
  // Return a fallback room ID to generate at build time
  // In production, you would typically generate this based on existing room IDs
  return [
    { roomId: 'fallback' },
    { roomId: 'demo' }  // Add a demo room for easier testing
  ];
} 
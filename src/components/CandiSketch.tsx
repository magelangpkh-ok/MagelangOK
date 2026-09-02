export default function CandiSketch() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      pointerEvents: 'none',
      /* The actual photo background */
      backgroundImage: "url('/candi-bg.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center 70%',
      backgroundRepeat: 'no-repeat',
      opacity: 0.35, /* Keep it subtle so UI stays readable */
      mixBlendMode: 'luminosity', /* Blends with the fresh mint/teal body background */
      filter: 'contrast(1.2) brightness(1.1)',
    }}>
      {/* Overlay Gradient to fade out the top and bottom edges smoothly into the UI */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 20%, transparent 70%, var(--bg-primary) 100%)',
      }} />
      
      {/* Subtle misty tech overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(240, 253, 244, 0.4) 100%)',
      }} />
    </div>
  );
}

import Game from './game/Game';

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a0533 0%, #2d1b69 50%, #0d0d2b 100%)',
      fontFamily: 'monospace',
      padding: '20px',
    }}>
      <h1 style={{
        color: '#FF69B4',
        fontSize: '36px',
        marginBottom: '4px',
        textShadow: '0 0 20px rgba(255,105,180,0.8), 0 0 40px rgba(255,105,180,0.4)',
        letterSpacing: '2px',
      }}>
        🦄 Unicorn Adventure 🌈
      </h1>
      <p style={{ color: '#FFB0DD', marginBottom: '12px', fontSize: '14px' }}>
        Stomp fish, collect crowns, eat the cookie!
      </p>
      <Game />
    </div>
  );
}

export default App;

import { Dispatch, SetStateAction, useEffect } from 'react';

export const WelcomeScreen = ({ onDismiss }: { onDismiss: Dispatch<SetStateAction<boolean>> }) => {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => onDismiss(false), reducedMotion ? 350 : 2400);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <main className="hospital-welcome" aria-label="Bienvenida al Hospital Camilo Villazón Pumarejo">
      <div className="welcome-orbit welcome-orbit-one" aria-hidden="true" />
      <div className="welcome-orbit welcome-orbit-two" aria-hidden="true" />
      <section className="welcome-content">
        <p className="welcome-eyebrow">BIENVENIDOS</p>
        <div className="welcome-logo-card">
          <img src="/hospital-logo.bmp" alt="Hospital Camilo Villazón Pumarejo" width="276" height="146" fetchPriority="high" />
        </div>
        <h1>Cuidamos de ti</h1>
        <p className="welcome-location">Pueblo Bello, Cesar</p>
        <div className="welcome-progress" aria-hidden="true"><span /></div>
        <button type="button" className="welcome-enter" onClick={() => onDismiss(false)}>Entrar ahora <span aria-hidden="true">→</span></button>
      </section>
      <p className="welcome-footer">Hospital Camilo Villazón Pumarejo</p>
    </main>
  );
};

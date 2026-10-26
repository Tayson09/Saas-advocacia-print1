import './AuthLayout.css'
import { ReactNode } from 'react'
import { ShieldCheck, CircleHelp } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

function SealLogo(): React.JSX.Element {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      {/* anel externo decorativo */}
      <circle cx="48" cy="48" r="46" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* anel interno */}
      <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />

      {/* traços decorativos (12h, 3h, 6h, 9h) */}
      <line x1="48" y1="2"  x2="48" y2="10" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="94" y1="48" x2="86" y2="48" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="48" y1="94" x2="48" y2="86" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2"  y1="48" x2="10" y2="48" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />

      {/* traços menores (45°, 135°, 225°, 315°) */}
      <line x1="80" y1="16" x2="75" y2="21" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />
      <line x1="80" y1="80" x2="75" y2="75" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="80" x2="21" y2="75" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="16" x2="21" y2="21" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeLinecap="round" />

      {/* --- balança --- */}

      {/* ornamento topo (pivot) */}
      <circle cx="48" cy="26" r="4" fill="white" fillOpacity="0.95" />

      {/* coluna central */}
      <rect x="46.5" y="26" width="3" height="32" rx="1.5" fill="white" fillOpacity="0.9" />

      {/* viga horizontal */}
      <rect x="20" y="36" width="56" height="2.5" rx="1.25" fill="white" fillOpacity="0.9" />

      {/* correntes */}
      <line x1="20" y1="38.5" x2="20" y2="52" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="76" y1="38.5" x2="76" y2="52" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />

      {/* bandeja esquerda */}
      <path d="M10 52 Q20 63 30 52" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.9" />

      {/* bandeja direita */}
      <path d="M66 52 Q76 63 86 52" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.9" />

      {/* base dupla */}
      <rect x="37" y="58" width="22" height="2" rx="1" fill="white" fillOpacity="0.7" />
      <rect x="30" y="60" width="36" height="2.5" rx="1.25" fill="white" fillOpacity="0.85" />
    </svg>
  )
}

function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="auth-layout">
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__brand">
          <SealLogo />
          <p className="auth-panel__name">VERUM</p>
          <div className="auth-panel__divider" />
          <p className="auth-panel__tagline">Sistema de Gestão Jurídica</p>
        </div>
      </aside>

      <div className="auth-content">
        <header className="auth-header">
          <span className="auth-header__item">
            <ShieldCheck size={15} />
            Ambiente seguro
          </span>
          <a
            className="auth-header__item auth-header__help"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <CircleHelp size={15} />
            Precisa de ajuda?
          </a>
        </header>

        <main className="auth-main">{children}</main>

        <footer className="auth-footer">
          <span>© 2026 Verum. Todos os direitos reservados.</span>
          <span className="auth-footer__links">
            <a href="#" onClick={(e) => e.preventDefault()}>
              Privacidade
            </a>
            <a href="#" onClick={(e) => e.preventDefault()}>
              Termos de uso
            </a>
          </span>
        </footer>
      </div>
    </div>
  )
}

export default AuthLayout

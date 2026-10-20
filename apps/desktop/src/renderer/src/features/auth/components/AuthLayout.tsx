import './AuthLayout.css'
import { ReactNode } from 'react'
import { ShieldCheck, CircleHelp } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

function ScalesIcon(): React.JSX.Element {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* base */}
      <line x1="13" y1="36" x2="31" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      {/* coluna */}
      <line x1="22" y1="34" x2="22" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      {/* viga */}
      <line x1="6" y1="17" x2="38" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      {/* ornamento topo */}
      <circle cx="22" cy="13" r="3.5" fill="white" fillOpacity="0.9" />
      {/* fio esquerdo */}
      <line x1="6" y1="17" x2="6" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      {/* bandeja esquerda */}
      <path d="M2 25 Q6 29 10 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.85" />
      {/* fio direito */}
      <line x1="38" y1="17" x2="38" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      {/* bandeja direita */}
      <path d="M34 25 Q38 29 42 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.85" />
    </svg>
  )
}

function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="auth-layout">
      <aside className="auth-panel" aria-hidden="true">
        <div className="auth-panel__logo">
          <ScalesIcon />
          <div className="auth-panel__wordmark">
            <span className="auth-panel__name">SaaS Advocacia</span>
            <span className="auth-panel__tagline">Sistema de gestão jurídica</span>
          </div>
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
          <span>© 2026 SaaS Advocacia. Todos os direitos reservados.</span>
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

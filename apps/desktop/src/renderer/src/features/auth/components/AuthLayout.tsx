import './AuthLayout.css'
import { ReactNode } from 'react'
import { ShieldCheck, CircleHelp } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

// estrutura comum das 4 telas: painel azul à esquerda + área de conteúdo centralizada
function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="auth-layout">
      <aside className="auth-panel" aria-hidden="true" />

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

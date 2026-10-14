import './PageIntro.css'

interface PageIntroProps {
  // rótulo em maiúsculas acima do título (ex: "ACESSO AO SISTEMA")
  label?: string
  title: string
  description: string
}

// cabeçalho textual repetido nas telas de auth
function PageIntro({ label, title, description }: PageIntroProps): React.JSX.Element {
  return (
    <div className="page-intro">
      {label && <span className="page-intro__label">{label}</span>}
      <h1 className="page-intro__title">{title}</h1>
      <p className="page-intro__description">{description}</p>
    </div>
  )
}

export default PageIntro

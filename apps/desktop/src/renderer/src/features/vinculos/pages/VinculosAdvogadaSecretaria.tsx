import './VinculosAdvogadaSecretaria.css'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { CalendarClock, Link2, Pencil, RotateCw, Slash, UserMinus } from 'lucide-react'
import AppLayout from '../../../components/layout/AppLayout'
import Select from '../../../components/ui/Select'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import Alert from '../../../components/ui/Alert'
import Modal from '../../../components/ui/Modal'
import { useToast } from '../../../components/ui/Toast'
import { ApiError } from '../../../lib/http'
import {
  cancelLink,
  createLink,
  endLink,
  listLinks,
  listUsersByRole,
  updateLinkEndDate,
  type Link,
  type UserSummary
} from '../api'
import { createLinkSchema, validateEndDate } from '../validation'
import {
  formatDate,
  isModifiable,
  sortLinks,
  statusLabels,
  statusOf,
  todayISO,
  type LinkStatus
} from '../links'

type FieldErrors = Partial<Record<'lawyerId' | 'secretaryId' | 'startDate' | 'endDate', string>>
type ActionType = 'end' | 'cancel' | 'edit'

interface ActionState {
  type: ActionType
  link: Link
}

function VinculosAdvogadaSecretaria(): React.JSX.Element {
  const toast = useToast()

  // base dos seletores: advogados e secretários ativos
  const [lawyers, setLawyers] = useState<UserSummary[]>([])
  const [secretaries, setSecretaries] = useState<UserSummary[]>([])
  const [loadingBase, setLoadingBase] = useState(true)
  const [baseError, setBaseError] = useState('')

  // lista de vínculos
  const [links, setLinks] = useState<Link[]>([])
  const [loadingLinks, setLoadingLinks] = useState(true)
  const [linksError, setLinksError] = useState('')

  // formulário de criação
  const [lawyerId, setLawyerId] = useState('')
  const [secretaryId, setSecretaryId] = useState('')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [creating, setCreating] = useState(false)

  // ação em um vínculo (encerrar / cancelar / editar término)
  const [action, setAction] = useState<ActionState | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editError, setEditError] = useState('')
  const [actionBusy, setActionBusy] = useState(false)

  // ---- carregamento (setState só em callbacks: evita setState síncrono no effect) ----
  function fetchBase(isActive: () => boolean): void {
    Promise.all([listUsersByRole('LAWYER'), listUsersByRole('SECRETARY')])
      .then(([lawyersList, secretariesList]) => {
        if (!isActive()) return
        setLawyers(lawyersList)
        setSecretaries(secretariesList)
      })
      .catch((err) => {
        if (isActive())
          setBaseError(
            messageFor(err, 'Não foi possível carregar advogados(as) e secretários(as).')
          )
      })
      .finally(() => {
        if (isActive()) setLoadingBase(false)
      })
  }

  function fetchLinks(isActive: () => boolean): void {
    listLinks()
      .then((list) => {
        if (isActive()) setLinks(list)
      })
      .catch((err) => {
        if (isActive()) setLinksError(messageFor(err, 'Não foi possível carregar os vínculos.'))
      })
      .finally(() => {
        if (isActive()) setLoadingLinks(false)
      })
  }

  useEffect(() => {
    let active = true
    fetchBase(() => active)
    fetchLinks(() => active)
    return () => {
      active = false
    }
  }, [])

  // recarregamentos acionados por eventos (setState síncrono é ok fora de effects)
  function handleRetryBase(): void {
    setLoadingBase(true)
    setBaseError('')
    fetchBase(() => true)
  }

  function reloadLinks(): void {
    setLoadingLinks(true)
    setLinksError('')
    fetchLinks(() => true)
  }

  const lawyerOptions = useMemo(
    () => lawyers.map((l) => ({ value: l.id, label: `${l.name} — ${l.email}` })),
    [lawyers]
  )
  const secretaryOptions = useMemo(
    () => secretaries.map((s) => ({ value: s.id, label: `${s.name} — ${s.email}` })),
    [secretaries]
  )

  const today = todayISO()
  const sortedLinks = useMemo(() => sortLinks(links, today), [links, today])

  function resetForm(): void {
    setLawyerId('')
    setSecretaryId('')
    setStartDate(todayISO())
    setEndDate('')
    setFieldErrors({})
    setSubmitError('')
  }

  async function handleCreate(event: FormEvent): Promise<void> {
    event.preventDefault()
    setSubmitError('')

    const result = createLinkSchema.safeParse({ lawyerId, secretaryId, startDate, endDate })
    if (!result.success) {
      const next: FieldErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (field && !next[field]) next[field] = issue.message
      }
      setFieldErrors(next)
      return
    }

    setFieldErrors({})
    setCreating(true)
    try {
      await createLink({
        lawyerId: result.data.lawyerId,
        secretaryId: result.data.secretaryId,
        startDate: result.data.startDate,
        endDate: result.data.endDate ? result.data.endDate : null
      })
      const lawyer = lawyers.find((l) => l.id === result.data.lawyerId)
      const secretary = secretaries.find((s) => s.id === result.data.secretaryId)
      toast.success(
        `${secretary?.name ?? 'Secretário(a)'} agora apoia ${lawyer?.name ?? 'o(a) advogado(a)'}.`,
        { title: 'Vínculo criado' }
      )
      resetForm()
      reloadLinks()
    } catch (err) {
      handleCreateError(err)
    } finally {
      setCreating(false)
    }
  }

  function handleCreateError(err: unknown): void {
    if (err instanceof ApiError) {
      if (err.code === 'FORBIDDEN' || err.code === 'UNAUTHENTICATED') {
        toast.error('Você não tem permissão para gerenciar vínculos.', { title: 'Acesso negado' })
        return
      }
      // pessoas iguais
      if (err.code === 'SAME_LAWYER_SECRETARY_ID') {
        setFieldErrors((prev) => ({
          ...prev,
          secretaryId: 'Advogado(a) e secretário(a) devem ser pessoas diferentes'
        }))
        return
      }
      // papéis incompatíveis / usuário inativo
      if (
        err.code === 'INVALID_LAWYER_ROLE' ||
        err.code === 'INVALID_SECRETARY_ROLE' ||
        err.code === 'INACTIVE_LAWYER' ||
        err.code === 'INACTIVE_SECRETARY'
      ) {
        setSubmitError(err.message)
        toast.error(err.message, { title: 'Não foi possível criar o vínculo' })
        return
      }
      // advogado/secretária não existe mais: atualiza os seletores
      if (
        err.code === 'LAWYER_NOT_FOUND' ||
        err.code === 'SECRETARY_NOT_FOUND' ||
        err.code === 'NOT_FOUND'
      ) {
        setSubmitError('Advogado(a) ou secretário(a) não encontrado(a). Atualizamos as listas.')
        handleRetryBase()
        return
      }
      // data final anterior à inicial
      if (err.code === 'INVALID_DATE_RANGE') {
        setFieldErrors((prev) => ({
          ...prev,
          endDate: 'A data final não pode ser anterior à de início'
        }))
        return
      }
      // vínculo duplicado
      if (err.code === 'UNIQUE_CONSTRAINT' || err.code === 'CONFLICT') {
        const message = 'Já existe um vínculo ativo entre essas pessoas.'
        setSubmitError(message)
        toast.error(message, { title: 'Vínculo duplicado' })
        return
      }
      // validação devolvida pela API mapeada para os campos
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        const next: FieldErrors = {}
        for (const detail of err.details) {
          const field = detail.path as keyof FieldErrors
          if (field && !next[field]) next[field] = detail.message
        }
        setFieldErrors(next)
        setSubmitError('Revise os campos destacados e tente novamente.')
        return
      }
      setSubmitError(err.message)
      toast.error(err.message, { title: 'Não foi possível criar o vínculo' })
      return
    }
    const fallback = 'Não foi possível criar o vínculo.'
    setSubmitError(fallback)
    toast.error(fallback)
  }

  // abre o modal da ação escolhida, pré-preenchendo os campos quando necessário
  function openAction(type: ActionType, link: Link): void {
    setAction({ type, link })
    setCancelReason('')
    setEditError('')
    setEditEndDate(link.endDate ? link.endDate.slice(0, 10) : '')
  }

  function closeAction(): void {
    if (actionBusy) return
    setAction(null)
  }

  async function handleConfirmAction(): Promise<void> {
    if (!action) return
    const { type, link } = action

    if (type === 'edit') {
      const invalid = validateEndDate(editEndDate, link.startDate.slice(0, 10))
      if (invalid) {
        setEditError(invalid)
        return
      }
    }

    setActionBusy(true)
    try {
      if (type === 'end') {
        await endLink(link.id)
        toast.success('O vínculo foi encerrado.', { title: 'Vínculo encerrado' })
      } else if (type === 'cancel') {
        await cancelLink(link.id, cancelReason)
        toast.success('O vínculo foi cancelado.', { title: 'Vínculo cancelado' })
      } else {
        await updateLinkEndDate(link.id, editEndDate ? editEndDate : null)
        toast.success('A data de término foi atualizada.', { title: 'Vínculo atualizado' })
      }
      setAction(null)
      reloadLinks()
    } catch (err) {
      handleActionError(err, type)
    } finally {
      setActionBusy(false)
    }
  }

  function handleActionError(err: unknown, type: ActionType): void {
    if (err instanceof ApiError) {
      if (err.code === 'FORBIDDEN' || err.code === 'UNAUTHENTICATED') {
        toast.error('Você não tem permissão para gerenciar vínculos.', { title: 'Acesso negado' })
        return
      }
      // data final inválida ao editar: mostra no próprio campo do modal
      if (type === 'edit' && err.code === 'INVALID_DATE_RANGE') {
        setEditError('A data final não pode ser anterior à de início')
        return
      }
      // vínculo sumiu / já encerrado / já cancelado / não modificável: sincroniza a lista
      if (
        err.code === 'NOT_FOUND_LINK' ||
        err.code === 'NOT_FOUND' ||
        err.code === 'LINK_ALREADY_CANCELED' ||
        err.code === 'LINK_ALREADY_ENDED' ||
        err.code === 'LINK_NOT_MODIFIABLE' ||
        err.code === 'LINK_NOT_STARTED' ||
        err.code === 'CONFLICT'
      ) {
        toast.info(`${err.message} A lista foi atualizada.`)
        setAction(null)
        reloadLinks()
        return
      }
      toast.error(err.message, { title: 'Não foi possível concluir a ação' })
      return
    }
    toast.error('Não foi possível concluir a ação.')
  }

  const hasBoth = lawyers.length > 0 && secretaries.length > 0

  return (
    <AppLayout>
      <div className="vinculos">
        <header className="vinculos__head">
          <span className="vinculos__eyebrow">GESTÃO DE USUÁRIOS</span>
          <h1 className="vinculos__title">Vínculos advogado(a) ↔ secretário(a)</h1>
          <p className="vinculos__subtitle">
            Defina quais secretários(as) apoiam cada advogado(a), com período de início e término.
            Um(a) secretário(a) pode apoiar mais de um(a) advogado(a).
          </p>
        </header>

        {/* criação */}
        <div className="vinculos__grid">
          <form className="vinculos__card" onSubmit={handleCreate} noValidate>
            <h2 className="vinculos__card-title">Novo vínculo</h2>

            {loadingBase ? (
              <div className="vinculos__loading">
                <RotateCw size={18} className="vinculos__spin" />
                <span>Carregando advogados(as) e secretários(as)...</span>
              </div>
            ) : baseError ? (
              <div className="vinculos__state">
                <Alert variant="danger" title="Não foi possível carregar">
                  {baseError}
                </Alert>
                <Button
                  variant="secondary"
                  onClick={handleRetryBase}
                  leftIcon={<RotateCw size={16} />}
                >
                  Tentar novamente
                </Button>
              </div>
            ) : !hasBoth ? (
              <Alert variant="info" title="Cadastro incompleto">
                É preciso ter ao menos um(a) advogado(a) e um(a) secretário(a) cadastrados(as) para
                criar vínculos.
              </Alert>
            ) : (
              <>
                <div className="vinculos__fields">
                  <Select
                    label="Advogado(a)"
                    options={lawyerOptions}
                    placeholder="Selecione o(a) advogado(a)"
                    value={lawyerId}
                    onChange={(next) => {
                      setLawyerId(next)
                      setFieldErrors((prev) => ({ ...prev, lawyerId: undefined }))
                    }}
                    error={fieldErrors.lawyerId}
                  />

                  <Select
                    label="Secretário(a)"
                    options={secretaryOptions}
                    placeholder="Selecione o(a) secretário(a)"
                    value={secretaryId}
                    onChange={(next) => {
                      setSecretaryId(next)
                      setFieldErrors((prev) => ({ ...prev, secretaryId: undefined }))
                    }}
                    error={fieldErrors.secretaryId}
                  />

                  <div className="vinculos__dates">
                    <Input
                      label="Início"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, startDate: undefined }))
                      }}
                      error={fieldErrors.startDate}
                    />
                    <Input
                      label="Término (opcional)"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        setFieldErrors((prev) => ({ ...prev, endDate: undefined }))
                      }}
                      error={fieldErrors.endDate}
                      hint="Deixe em branco para um vínculo sem previsão de término."
                    />
                  </div>
                </div>

                {submitError && <Alert variant="danger">{submitError}</Alert>}

                <div className="vinculos__actions">
                  <Button type="button" variant="secondary" onClick={resetForm} disabled={creating}>
                    Limpar
                  </Button>
                  <Button type="submit" disabled={creating} rightIcon={<Link2 size={16} />}>
                    {creating ? 'Criando...' : 'Criar vínculo'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <aside className="vinculos__aside">
            <Alert variant="info" title="Como funciona o vínculo">
              O vínculo permite que o(a) secretário(a) auxilie no trabalho do(a) advogado(a). Você
              pode encerrar (término na data de hoje), cancelar (com motivo) ou ajustar a data de
              término a qualquer momento.
            </Alert>

            <div className="vinculos__tips">
              <h2 className="vinculos__tips-title">Estados do vínculo</h2>
              <ul className="vinculos__tips-list">
                <li>
                  <strong>Ativo</strong> — em vigência hoje.
                </li>
                <li>
                  <strong>Agendado</strong> — início em data futura.
                </li>
                <li>
                  <strong>Encerrado</strong> — término já passou.
                </li>
                <li>
                  <strong>Cancelado</strong> — interrompido com registro de motivo.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* lista */}
        <section className="vinculos__list-section">
          <div className="vinculos__list-header">
            <h2 className="vinculos__section-title">Vínculos cadastrados</h2>
            {!loadingLinks && !linksError && links.length > 0 && (
              <span className="vinculos__count">{links.length}</span>
            )}
            {!loadingLinks && (
              <button
                type="button"
                className="vinculos__refresh"
                onClick={reloadLinks}
                aria-label="Atualizar lista"
              >
                <RotateCw size={15} />
                Atualizar
              </button>
            )}
          </div>

          {loadingLinks ? (
            <div className="vinculos__loading">
              <RotateCw size={18} className="vinculos__spin" />
              <span>Carregando vínculos...</span>
            </div>
          ) : linksError ? (
            <div className="vinculos__state">
              <Alert variant="danger">{linksError}</Alert>
              <Button variant="secondary" onClick={reloadLinks} leftIcon={<RotateCw size={16} />}>
                Tentar novamente
              </Button>
            </div>
          ) : links.length === 0 ? (
            <p className="vinculos__empty">Nenhum vínculo cadastrado ainda.</p>
          ) : (
            <ul className="vinculos__list">
              {sortedLinks.map((link) => {
                const status = statusOf(link, today)
                return (
                  <li key={link.id} className="vinculos__item">
                    <div className="vinculos__item-main">
                      <StatusBadge status={status} />
                      <div className="vinculos__pair">
                        <span className="vinculos__person">
                          <span className="vinculos__person-role">Advogado(a)</span>
                          <span className="vinculos__person-name">{link.lawyer.name}</span>
                        </span>
                        <Link2 size={15} className="vinculos__pair-icon" />
                        <span className="vinculos__person">
                          <span className="vinculos__person-role">Secretário(a)</span>
                          <span className="vinculos__person-name">{link.secretary.name}</span>
                        </span>
                      </div>
                    </div>

                    <div className="vinculos__item-meta">
                      <span className="vinculos__period">
                        <CalendarClock size={14} />
                        {formatDate(link.startDate)} — {formatDate(link.endDate)}
                      </span>
                      {status === 'canceled' && (
                        <span className="vinculos__reason">
                          Cancelado em {formatDate(link.canceledAt)}
                          {link.cancellationReason ? ` · ${link.cancellationReason}` : ''}
                        </span>
                      )}
                    </div>

                    {isModifiable(status) && (
                      <div className="vinculos__item-actions">
                        <button
                          type="button"
                          className="vinculos__action"
                          onClick={() => openAction('edit', link)}
                        >
                          <Pencil size={15} />
                          Editar término
                        </button>
                        <button
                          type="button"
                          className="vinculos__action"
                          onClick={() => openAction('end', link)}
                        >
                          <UserMinus size={15} />
                          Encerrar
                        </button>
                        <button
                          type="button"
                          className="vinculos__action vinculos__action--danger"
                          onClick={() => openAction('cancel', link)}
                        >
                          <Slash size={15} />
                          Cancelar
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* modal de ação */}
      <Modal open={action !== null} onClose={closeAction} title={actionTitle(action?.type)}>
        {action && (
          <>
            {action.type === 'end' && (
              <p className="vinculos__confirm-text">
                Deseja encerrar o vínculo de <strong>{action.link.secretary.name}</strong> com{' '}
                <strong>{action.link.lawyer.name}</strong>? A data de término será hoje (
                {formatDate(today)}).
              </p>
            )}

            {action.type === 'cancel' && (
              <div className="vinculos__modal-form">
                <p className="vinculos__confirm-text">
                  Cancelar o vínculo de <strong>{action.link.secretary.name}</strong> com{' '}
                  <strong>{action.link.lawyer.name}</strong>. Essa ação não pode ser desfeita.
                </p>
                <Input
                  label="Motivo (opcional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ex.: vínculo cadastrado incorretamente"
                  autoComplete="off"
                  maxLength={300}
                />
              </div>
            )}

            {action.type === 'edit' && (
              <div className="vinculos__modal-form">
                <p className="vinculos__confirm-text">
                  Ajuste a data de término do vínculo de{' '}
                  <strong>{action.link.secretary.name}</strong> com{' '}
                  <strong>{action.link.lawyer.name}</strong>.
                </p>
                <Input
                  label="Término"
                  type="date"
                  value={editEndDate}
                  min={action.link.startDate.slice(0, 10)}
                  onChange={(e) => {
                    setEditEndDate(e.target.value)
                    setEditError('')
                  }}
                  error={editError}
                  hint="Deixe em branco para remover a previsão de término."
                />
              </div>
            )}

            <div className="vinculos__confirm-actions">
              <Button variant="secondary" onClick={closeAction} disabled={actionBusy}>
                Voltar
              </Button>
              <Button
                variant={action.type === 'cancel' ? 'primary' : 'primary'}
                onClick={() => void handleConfirmAction()}
                disabled={actionBusy}
              >
                {actionBusy ? 'Processando...' : actionConfirmLabel(action.type)}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </AppLayout>
  )
}

function StatusBadge({ status }: { status: LinkStatus }): React.JSX.Element {
  return (
    <span className={`vinculos__badge vinculos__badge--${status}`}>{statusLabels[status]}</span>
  )
}

function actionTitle(type?: ActionType): string {
  if (type === 'end') return 'Encerrar vínculo'
  if (type === 'cancel') return 'Cancelar vínculo'
  if (type === 'edit') return 'Editar término'
  return ''
}

function actionConfirmLabel(type: ActionType): string {
  if (type === 'end') return 'Encerrar vínculo'
  if (type === 'cancel') return 'Cancelar vínculo'
  return 'Salvar'
}

// extrai uma mensagem amigável (ApiError traz a mensagem pt-br da API)
function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.code === 'FORBIDDEN' || err.code === 'UNAUTHENTICATED') {
      return 'Você não tem permissão para gerenciar vínculos.'
    }
    return err.message || fallback
  }
  return fallback
}

export default VinculosAdvogadaSecretaria

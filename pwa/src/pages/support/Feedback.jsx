import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import PageHeader from '@/components/layout/PageHeader'

const QUESTIONS = [
  { id: 'q1', label: '¿Qué tan fácil fue usar Treevü?', emoji: ['😕', '😐', '🙂', '😊', '🤩'] },
  { id: 'q2', label: '¿Recomendarías Treevü a un compañero?', emoji: ['No', 'Tal vez', 'Sí'] },
]

export default function Feedback() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    setSent(true)
    await new Promise((r) => setTimeout(r, 800))
    setTimeout(() => navigate('/home'), 1500)
  }

  if (sent) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[var(--color-secondary)] text-4xl"
            style={{ fontVariationSettings: '"FILL" 1' }}>
            favorite
          </span>
        </div>
        <h2 className="font-bold text-xl text-[var(--color-on-surface)] mb-2"
          style={{ fontFamily: 'var(--font-headline)' }}>
          ¡Gracias por tu feedback!
        </h2>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Tu opinión nos ayuda a mejorar Treevü.
        </p>
      </div>
    )
  }

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      <PageHeader title="Feedback del piloto" />

      <div className="px-4 pb-safe space-y-4">
        {QUESTIONS.map(({ id, label, emoji }) => (
          <Card key={id} className="p-5 space-y-3">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {label}
            </p>
            <div className="flex gap-2 justify-center">
              {emoji.map((e, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [id]: i }))}
                  className={`
                    flex-1 h-12 rounded-[var(--radius-lg)] text-xl flex items-center justify-center
                    transition-all duration-150
                    ${answers[id] === i
                      ? 'ring-2 ring-[var(--color-primary)] bg-[var(--color-primary-fixed)] scale-110'
                      : 'bg-[var(--color-surface-container-high)] active:bg-[var(--color-surface-container-highest)]'
                    }
                  `}
                >
                  {e}
                </button>
              ))}
            </div>
          </Card>
        ))}

        <Card className="p-5 space-y-3">
          <p className="text-sm font-semibold text-[var(--color-on-surface)]"
            style={{ fontFamily: 'var(--font-headline)' }}>
            ¿Algún comentario adicional?
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Cuéntanos qué mejorarías..."
            className="
              w-full rounded-[var(--radius-xl)] p-4
              bg-[var(--color-surface-container-high)]
              text-[var(--color-on-surface)] text-sm
              placeholder:text-[var(--color-outline)]
              focus:outline-none focus:ring-1 focus:ring-[rgba(0,6,102,0.2)]
              resize-none transition-all duration-150
            "
          />
        </Card>

        <Button onClick={handleSend}>Enviar feedback</Button>
      </div>
    </div>
  )
}

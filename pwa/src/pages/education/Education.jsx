import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/ui/Card'
import PulseBar from '@/components/ui/PulseBar'

const LESSONS = [
  {
    id: 'l1',
    level: 1,
    title: 'Cómo armar tu presupuesto mensual',
    duration: '5 min',
    completed: true,
    icon: 'account_balance',
    color: 'bg-[var(--color-secondary-container)]',
    iconColor: 'text-[var(--color-secondary)]',
  },
  {
    id: 'l2',
    level: 2,
    title: 'Evitar deudas innecesarias',
    duration: '7 min',
    completed: false,
    icon: 'credit_card_off',
    color: 'bg-[var(--color-primary-fixed)]',
    iconColor: 'text-[var(--color-primary)]',
    current: true,
  },
  {
    id: 'l3',
    level: 3,
    title: 'Ahorro de emergencia paso a paso',
    duration: '8 min',
    completed: false,
    locked: true,
    icon: 'savings',
    color: 'bg-[var(--color-surface-container-high)]',
    iconColor: 'text-[var(--color-outline)]',
  },
  {
    id: 'l4',
    level: 4,
    title: 'Entendiendo tu sueldo devengado',
    duration: '4 min',
    completed: false,
    locked: true,
    icon: 'payments',
    color: 'bg-[var(--color-surface-container-high)]',
    iconColor: 'text-[var(--color-outline)]',
  },
]

export default function Education() {
  const [activeLesson, setActiveLesson] = useState(null)
  const completedCount = LESSONS.filter((l) => l.completed).length

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-dvh">
      {/* Header */}
      <div className="editorial-gradient px-6 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-white font-bold text-2xl mb-1"
            style={{ fontFamily: 'var(--font-headline)' }}>
            Educación Financiera
          </h1>
          <p className="text-white/70 text-sm mb-5">
            Construye hábitos que mejoran tu bienestar
          </p>
          <PulseBar
            value={completedCount}
            max={LESSONS.length}
            label="Tu progreso"
            sublabel={`${completedCount}/${LESSONS.length} lecciones`}
          />
        </div>
      </div>

      {/* Lessons */}
      <div className="px-4 py-4 pb-safe space-y-3">
        {LESSONS.map((lesson) => (
          <Card
            key={lesson.id}
            className={`p-4 ${lesson.locked ? 'opacity-50' : ''}`}
            onClick={lesson.locked ? undefined : () => setActiveLesson(lesson)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${lesson.color}`}>
                {lesson.completed ? (
                  <span className="material-symbols-outlined text-[var(--color-secondary)] text-2xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}>
                    check_circle
                  </span>
                ) : lesson.locked ? (
                  <span className="material-symbols-outlined text-[var(--color-outline)] text-2xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}>
                    lock
                  </span>
                ) : (
                  <span className={`material-symbols-outlined text-2xl ${lesson.iconColor}`}
                    style={{ fontVariationSettings: '"FILL" 1' }}>
                    {lesson.icon}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                    Nivel {lesson.level}
                  </span>
                  {lesson.current && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-fixed)] px-1.5 py-0.5 rounded-full">
                      Continuar
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--color-on-surface)] leading-tight">
                  {lesson.title}
                </p>
                <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                  {lesson.duration} de lectura
                </p>
              </div>
              {!lesson.locked && !lesson.completed && (
                <span className="material-symbols-outlined text-[var(--color-outline)] text-xl">
                  chevron_right
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {activeLesson && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setActiveLesson(null)}
        >
          <div
            className="w-full max-w-[430px] mx-auto bg-[var(--color-surface)] rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[var(--color-outline-variant)] rounded-full mx-auto mb-6" />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${activeLesson.color}`}>
              <span className={`material-symbols-outlined text-3xl ${activeLesson.iconColor}`}
                style={{ fontVariationSettings: '"FILL" 1' }}>
                {activeLesson.icon}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">
              Nivel {activeLesson.level} · {activeLesson.duration}
            </p>
            <h2 className="font-bold text-xl text-[var(--color-on-surface)] mb-3"
              style={{ fontFamily: 'var(--font-headline)' }}>
              {activeLesson.title}
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6">
              En esta lección aprenderás a organizar tus ingresos y gastos para tomar mejores decisiones financieras mes a mes.
            </p>
            <button
              className="w-full h-14 editorial-gradient text-white font-semibold rounded-[var(--radius-xl)]"
              onClick={() => setActiveLesson(null)}
            >
              Comenzar lección
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

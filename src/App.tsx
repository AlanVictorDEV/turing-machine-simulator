
import { useEffect, useState } from 'react'
import styles from './App.module.css'
import { EXAMPLE_SOURCE } from './data/examples'
import {
  advance,
  createInitialSnapshot,
  parseProgram,
  runToEnd,
  statusLabel,
  type Snapshot,
  type MachineProgram,
} from './turingMachine'

export default function App() {
  const [source, setSource] = useState(EXAMPLE_SOURCE)
  const [program, setProgram] = useState<MachineProgram | null>(
    () => parseProgram(EXAMPLE_SOURCE),
  )
  const [snapshot, setSnapshot] = useState<Snapshot>(
    () => createInitialSnapshot(parseProgram(EXAMPLE_SOURCE)),
  )
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(600)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!playing || !program) return

    const timer = window.setInterval(() => {
      setSnapshot((current) => {
        if (
          ['accepted', 'rejected', 'limit'].includes(current.status)
        ) {
          setPlaying(false)
          return current
        }

        const next = advance(program, current)

        if (['accepted', 'rejected', 'limit'].includes(next.status)) {
          setPlaying(false)
        }

        return next
      })
    }, speed)

    return () => window.clearInterval(timer)
  }, [playing, program, speed])

  function carregarPrograma() {
    try {
      const parsed = parseProgram(source)
      setProgram(parsed)
      setSnapshot(createInitialSnapshot(parsed))
      setError('')
      setPlaying(false)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Erro ao carregar programa.',
      )
      setPlaying(false)
    }
  }

  function resetar() {
    if (!program) return
    setSnapshot(createInitialSnapshot(program))
    setPlaying(false)
  }

  function passo() {
    if (!program) return
    if (['accepted', 'rejected', 'limit'].includes(snapshot.status)) {
      return
    }

    setSnapshot(advance(program, snapshot))
    setPlaying(false)
  }

  function executarTudo() {
    if (!program) return

    const history = runToEnd(
      program,
      createInitialSnapshot(program),
      1000,
    )

    setSnapshot(history[history.length - 1])
    setPlaying(false)
  }

  async function abrirArquivo(file?: File) {
    if (!file) return
    setSource(await file.text())
    setPlaying(false)
  }

  const inicio = Math.max(0, snapshot.head - 5)
  const fim = Math.min(snapshot.tape.length, snapshot.head + 8)
  const fita = snapshot.tape
    .slice(inicio, fim)
    .map((symbol, i) => ({ symbol, index: inicio + i }))

  const terminal = ['accepted', 'rejected', 'limit'].includes(
    snapshot.status,
  )

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <strong>Simulador de Máquina de Turing</strong>
      </header>

      <div className={styles.controls}>
        <button
          onClick={() => {
            if (terminal) resetar()
            setPlaying(true)
          }}
          disabled={playing}
        >
          Executar
        </button>

        <button onClick={() => setPlaying(false)} disabled={!playing}>
          Parar
        </button>

        <button onClick={resetar}>Resetar</button>

        <button onClick={passo} disabled={!program || terminal}>
          Passo
        </button>

        <button onClick={executarTudo} disabled={!program}>
          Até o fim
        </button>

        <label className={styles.fileButton}>
          Abrir arquivo
          <input
            type="file"
            accept=".txt,.mt,.ufc"
            onChange={(e) => abrirArquivo(e.target.files?.[0])}
          />
        </label>

        <button onClick={carregarPrograma}>Carregar fonte</button>
      </div>

      <div className={styles.speed}>
        <span>Velocidade:</span>
        <input
          type="range"
          min="150"
          max="1200"
          step="50"
          value={1350 - speed}
          onChange={(e) => setSpeed(1350 - Number(e.target.value))}
        />
      </div>

      <section className={styles.source}>
        <label htmlFor="source">Arquivo fonte:</label>
        <textarea
          id="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          spellCheck={false}
        />
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <section className={styles.machine}>
        <h2>Fita</h2>

        <div className={styles.tape}>
          {fita.map(({ symbol, index }) => (
            <div
              key={index}
              className={`${styles.cell} ${
                index === snapshot.head
                  ? styles.current
                  : terminal
                    ? styles.finished
                    : styles.normal
              }`}
            >
              <span>{symbol === ' ' ? '_' : symbol}</span>
            </div>
          ))}
        </div>

        <div className={styles.head}>
          <span>—</span>
          <span>↓</span>
          <span>—</span>
        </div>

        <div className={styles.result}>
          <p>
            <strong>Estado atual:</strong> {snapshot.state}
          </p>
          <p>
            <strong>Passos:</strong> {snapshot.step}
          </p>
          <p>
            <strong>Posição:</strong> {snapshot.head}
          </p>
          <p>
            <strong>Situação:</strong> {statusLabel(snapshot.status)}
          </p>
          <p>
            <strong>Leitura:</strong>{' '}
            {snapshot.rule?.read ?? '—'}
          </p>
          <p>
            <strong>Escrita:</strong>{' '}
            {snapshot.rule?.write ?? '—'}
          </p>
          <p>
            <strong>Próximo estado:</strong>{' '}
            {snapshot.rule?.to ?? '—'}
          </p>
          <p>{snapshot.message}</p>
        </div>
      </section>

      
    </main>
  )
}

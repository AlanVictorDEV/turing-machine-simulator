export type Direction = 'L' | 'R' | 'S'
export type Rule = {
  from: string
  read: string
  to: string
  write: string
  move: Direction
}
export type MachineProgram = {
  input: string
  initialState: string
  acceptStates: string[]
  rules: Rule[]
  states: string[]
  alphabet: string[]
}
export type Snapshot = {
  tape: string[]
  head: number
  state: string
  step: number
  rule?: Rule
  message: string
  status: 'ready' | 'running' | 'accepted' | 'rejected' | 'limit'
}

export function parseProgram(source: string): MachineProgram {
  let input = ''
  let initialState = ''
  let acceptStates: string[] = []
  const rules: Rule[] = []
  const errors: string[] = []

  source.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim()
    if (!line || line.startsWith('#') ) return
    const parts = line.split(',').map((part) => part.trim())
    if (parts.length === 1) {
      const match = line.match(/^(fita|init|accept)\s+(.+)$/i)
      if (!match) {
        errors.push(`Linha ${index + 1}: comando desconhecido "${line}".`)
        return
      }
      const [, command, value] = match
      if (command.toLowerCase() === 'fita') input = value.replace(/_/g, ' ')
      if (command.toLowerCase() === 'init') initialState = value
      if (command.toLowerCase() === 'accept') acceptStates = value.split(/[\s,]+/).filter(Boolean)
      return
    }
    if (parts.length !== 5) {
      errors.push(`Linha ${index + 1}: a transição precisa ter 5 campos: estado,lido,próximo,escrito,movimento.`)
      return
    }
    const [from, readRaw, to, writeRaw, moveRaw] = parts
    const moveMap: Record<string, Direction> = { '>': 'R', '<': 'L', R: 'R', L: 'L', S: 'S', N: 'S' }
    const move = moveMap[moveRaw.toUpperCase()]
    if (!move) {
      errors.push(`Linha ${index + 1}: movimento "${moveRaw}" inválido. Use >, <, L, R ou S.`)
      return
    }
    rules.push({ from, read: readRaw === '_' ? ' ' : readRaw, to, write: writeRaw === '_' ? ' ' : writeRaw, move })
  })

  if (!initialState) errors.push('Informe o estado inicial usando "init nomeEstado".')
  if (!acceptStates.length) errors.push('Informe ao menos um estado final usando "accept nomeEstado".')
  if (!rules.length) errors.push('Adicione pelo menos uma regra de transição.')
  const seen = new Set<string>()
  for (const rule of rules) {
    const key = `${rule.from}\u0000${rule.read}`
    if (seen.has(key)) errors.push(`Transição ambígua: há mais de uma regra para (${rule.from}, ${rule.read === ' ' ? '_' : rule.read}).`)
    seen.add(key)
  }
  if (errors.length) throw new Error(errors.join('\n'))
  const states = [...new Set([initialState, ...acceptStates, ...rules.flatMap((rule) => [rule.from, rule.to])])]
  const alphabet = [...new Set(rules.flatMap((rule) => [rule.read, rule.write]).filter((symbol) => symbol !== ' '))]
  return { input, initialState, acceptStates, rules, states, alphabet }
}

export function createInitialSnapshot(program: MachineProgram): Snapshot {
  const symbols = Array.from(program.input || '')
  return {
    tape: symbols.length ? symbols : [' '],
    head: 0,
    state: program.initialState,
    step: 0,
    message: 'Máquina pronta para iniciar.',
    status: 'ready',
  }
}

export function advance(program: MachineProgram, current: Snapshot): Snapshot {
  if (current.status === 'accepted' || current.status === 'rejected' || current.status === 'limit') return current
  if (program.acceptStates.includes(current.state)) {
    return { ...current, status: 'accepted', message: `A palavra foi aceita no estado final ${current.state}.` }
  }
  const symbol = current.tape[current.head] ?? ' '
  const rule = program.rules.find((item) => item.from === current.state && item.read === symbol)
  if (!rule) {
    return { ...current, status: 'rejected', message: `Não existe transição para (${current.state}, ${symbol === ' ' ? '_' : symbol}). A máquina rejeitou a entrada.` }
  }

  const tape = [...current.tape]
  tape[current.head] = rule.write
  let head = current.head + (rule.move === 'R' ? 1 : rule.move === 'L' ? -1 : 0)
  if (head < 0) {
    tape.unshift(' ')
    head = 0
  }
  if (head >= tape.length) tape.push(' ')

  const next: Snapshot = {
    tape,
    head,
    state: rule.to,
    step: current.step + 1,
    rule,
    status: 'running',
    message: `${rule.from} leu ${symbol === ' ' ? '_' : symbol}, escreveu ${rule.write === ' ' ? '_' : rule.write} e moveu ${rule.move === 'L' ? 'à esquerda' : rule.move === 'R' ? 'à direita' : 'sem mover'}.`,
  }
  if (program.acceptStates.includes(rule.to)) {
    next.status = 'accepted'
    next.message = `A palavra foi aceita no estado final ${rule.to}.`
  }
  return next
}

export function runToEnd(program: MachineProgram, initial: Snapshot, maxSteps = 1000): Snapshot[] {
  const history = [initial]
  let current = initial
  while (current.status !== 'accepted' && current.status !== 'rejected' && current.status !== 'limit' && current.step < maxSteps) {
    current = advance(program, current)
    history.push(current)
  }
  if (current.step >= maxSteps && current.status !== 'accepted' && current.status !== 'rejected') {
    history.push({ ...current, status: 'limit', message: `Limite de ${maxSteps} passos atingido. A máquina pode estar em loop.` })
  }
  return history
}

export function statusLabel(status: Snapshot['status']): string {
  return ({ ready: 'Pronta', running: 'Executando', accepted: 'Aceita', rejected: 'Rejeitada', limit: 'Limite atingido' })[status]
}
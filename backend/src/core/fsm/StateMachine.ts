export class StateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateMachineError';
  }
}

export abstract class StateMachine<TState extends string, TEvent extends string> {
  protected transitions: Map<TState, Map<TEvent, TState>>;

  constructor() {
    this.transitions = new Map();
    this.configure();
  }

  protected abstract configure(): void;

  protected addTransition(from: TState, event: TEvent, to: TState): void {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, new Map());
    }
    this.transitions.get(from)!.set(event, to);
  }

  public getNextState(currentState: TState, event: TEvent): TState {
    const stateTransitions = this.transitions.get(currentState);

    if (!stateTransitions) {
      throw new StateMachineError(`Invalid current state: ${currentState}`);
    }

    const nextState = stateTransitions.get(event);

    if (!nextState) {
      throw new StateMachineError(
        `Invalid transition: Cannot process event '${event}' from state '${currentState}'`
      );
    }

    return nextState;
  }

  public canProcess(currentState: TState, event: TEvent): boolean {
    const stateTransitions = this.transitions.get(currentState);
    return stateTransitions !== undefined && stateTransitions.has(event);
  }
}

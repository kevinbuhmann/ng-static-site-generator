export interface Task {
  run(): Promise<void>;
}

export class StateService {
    private intervalId: NodeJS.Timeout | null = null;

    start(): void {
        if (this.intervalId !== null) {
            return;
        }

        this.intervalId = setInterval(() => {
            this.poll();
        }, 1000);
    }

    stop(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private poll(): void {
    }
}
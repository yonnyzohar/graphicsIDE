interface EventListener {
    (data?: any): void;
}

export class EventDispatcher {
    private listeners: Map<string, EventListener[]> = new Map();

    // Add an event listener
    addEventListener(event: string, listener: EventListener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(listener);
    }

    // Remove an event listener
    removeEventListener(event: string, listener: EventListener): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            const index = eventListeners.indexOf(listener);
            if (index !== -1) {
                eventListeners.splice(index, 1);
            }
        }
    }

    // Dispatch an event
    dispatchEvent(event: string, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => listener(data));
        }
    }
}
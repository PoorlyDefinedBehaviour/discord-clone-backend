import Observer from "../interfaces/Observer";
import Observable from "../interfaces/Observable";

type Dictionary<T> = {
  [key: string]: T;
};

export default class Chat implements Observable {
  private observers: Dictionary<Set<Observer>> = {};

  public subscribe(server_id: string, observer: Observer): void {
    if (!this.observers[server_id]) {
      this.observers[server_id] = new Set<Observer>();
    }

    this.observers[server_id].add(observer);
  }

  public unsubscribe(server_id: string, observer: Observer): void {
    if (this.observers[server_id]) {
      this.observers[server_id].delete(observer);
    }
  }

  public notify(server_id: string, data): void {
    if (this.observers[server_id]) {
      this.observers[server_id].forEach((observer) => observer.notify(data));
    }
  }

  public send(data): void {
    this.notify(data.message.server_id, data);
  }
}

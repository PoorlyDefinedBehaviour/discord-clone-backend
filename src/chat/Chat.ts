import Observer from "../interfaces/Observer";
import Observable from "../interfaces/Observable";

type Dictionary<T> = {
  [key: string]: T;
};

export default class Chat implements Observable {
  private observers: Dictionary<Observer[]> = {};

  public subscribe(room: string, observer: Observer): void {
    if (!this.observers[room]) {
      this.observers[room] = [];
    }

    this.observers[room].push(observer);
  }

  public unsubscribe(room: string, observer: Observer): void {
    this.observers[room] = this.observers[room].filter(
      (obs) => obs !== observer
    );
  }

  public notify(room: string, data): void {
    this.observers[room].forEach((observer) => observer.notify(data));
  }

  public send(room: string, data): void {
    this.notify(room, data);
  }
}

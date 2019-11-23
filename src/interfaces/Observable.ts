import Observer from "./Observer";

export default interface Observable {
  subscribe: (room: string, observer: Observer) => void;
  unsubscribe: (room: string, observer: Observer) => void;
  notify: (room: string, data) => void;
}

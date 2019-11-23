import Chat from "./Chat";
import Observer from "../interfaces/Observer";

export default class User implements Observer {
  constructor(
    private readonly chat: Chat,
    private readonly socket,
    private readonly room: string
  ) {
    this.socket.on("message", (data) => {
      this.chat.send(data.message.room, { ...data, type: "text" });
    });

    this.socket.on("voice", (data) => {
      this.chat.send(data.data.room, { ...data, type: "voice" });
    });

    this.socket.on("disconnect", this.chat.unsubscribe(this.room, this));
  }

  public notify(data): void {
    if (data.sender_id !== this.socket.id) {
      this.socket.emit(data.type, data);
    }
  }
}

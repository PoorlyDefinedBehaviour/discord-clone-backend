import Chat from "./Chat";
import Observer from "../interfaces/Observer";

export default class User implements Observer {
  constructor(
    private readonly chat: Chat,
    private readonly socket,
    private readonly data
  ) {
    this.socket.on("message", (data) => {
      this.chat.send({ ...data, type: "text" });
    });

    this.socket.on("voice", (data) => {
      this.chat.send({
        ...data,
        type: "voice"
      });
    });

    this.socket.on("disconnect", () =>
      this.chat.unsubscribe(this.data.server_id, this)
    );
  }

  public notify(data): void {
    if (data.message.author._id !== this.data.user_id) {
      this.socket.emit(data.type, data);
    }
  }
}

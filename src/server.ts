import type * as Party from "partykit/server";

export default class Server implements Party.Server {
  constructor(public party: Party.Party) {}

  messages: { senderId: string, text: string }[] = [];
  colors: string[] = ['#ff0000',
  '#ff2600',
  '#ff4c00',
  '#ff7200',
  '#ff9900',
  '#ffbf00',
  '#ffe500',
  '#f2ff00',
  '#cbff00',
  '#a5ff00',
  '#7fff00',
  '#59ff00',
  '#33ff00',
  '#0cff00',
  '#00ff19',
  '#00ff3f',
  '#00ff66',
  '#00ff8c',
  '#00ffb2',
  '#00ffd8',
  '#00ffff',
  '#00d8ff',
  '#00b2ff',
  '#008cff',
  '#0066ff',
  '#003fff',
  '#0019ff',
  '#0c00ff',
  '#3200ff',
  '#5900ff',
  '#7f00ff',
  '#a500ff',
  '#cc00ff',
  '#f200ff',
  '#ff00e5',
  '#ff00bf',
  '#ff0098',
  '#ff0072',
  '#ff004c',
  '#ff0026'];
  assignedColors: {userId: string, senderColor: string}[] = [];

  async onStart() {
    await this.party.storage.delete("messages");
    await this.party.storage.delete("colors");
    await this.party.storage.delete("assignedColors");
    this.messages = (await this.party.storage.get<{ senderId: string, text: string }[]>("messages")) ?? [];
    this.colors = (await this.party.storage.get<string[]>("colors")) ?? this.colors;
    this.assignedColors = (await this.party.storage.get<{userId: string, senderColor: string}[]>("assignedColors")) ?? this.assignedColors;
  };

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    let randomIndex = Math.floor(Math.random() * this.colors.length);
    let new_color = this.colors[randomIndex];
    this.colors.splice(randomIndex, 1);
    this.assignedColors.push({userId: conn.id, senderColor: new_color});
    this.party.storage.put("assignedColors", this.assignedColors);
    this.party.storage.put("colors", this.colors);
    console.log(`connection ${conn.id} assigned color: ${new_color}`);
    console.log(`remaining number of colors: ${this.colors.length}}`);

    this.party.broadcast(
      (JSON.stringify({"color_list": this.assignedColors}))
    );

    conn.send(JSON.stringify({"chat_history": this.messages}));

  //   console.log(
  //     `Connected:
  // id: ${conn.id}
  // room: ${this.party.id}
  // url: ${new URL(ctx.request.url).pathname}`
  //   );

    
  }

  async onMessage(message: string, sender: Party.Connection) {
    
    // TODO
    // do some random chance stuff and have like 20$ of messages go through normally, 70% get reversed, and 10% get turned into emojis or something

    const newMessage = {
      senderId: sender.id,
      text: message
    };
  

    this.messages.push(newMessage);
    this.party.storage.put("messages", this.messages);
    // conn.send(message);

    // as well as broadcast it to all the other connections in the room...
    this.party.broadcast(
      JSON.stringify({"new_chat": newMessage})//,
      // ...except for the connection it came from
      // [sender.id]
    );
  }
  
}

Server satisfies Party.Worker;

import "./styles.css";

import PartySocket from "partysocket";

declare const PARTYKIT_HOST: string;

// A PartySocket is like a WebSocket, except it's a bit more magical.
// It handles reconnection logic, buffering messages while it's offline, and more.
const conn = new PartySocket({
  host: PARTYKIT_HOST,
  room: "my-new-room",
});

var color_list: {userId: string, senderColor: string}[] = [];

// You can even start sending messages before the connection is open!
conn.addEventListener("message", (event) => {
  // let dataDict = JSON.parse(event.data);
  // let id = Object.keys(dataDict)[0];
  // let text = dataDict[id];  
  // console.log(`connection ${id} sent message: ${text}`);
  
  let parsedData = JSON.parse(event.data);
  if (parsedData.hasOwnProperty('chat_history')) {
    let history_messages = parsedData["chat_history"];
    if (history_messages.length > 0) {
      console.log("chat history found")
      history_messages.forEach((message: {senderId: string, text: string}) => {
        chatAppend(message.text, message.senderId);
        console.log(`${message.senderId} sent message: ${message.text}`);
    });
    }
  } else if (parsedData.hasOwnProperty('new_chat')) {
    let newMessage = parsedData["new_chat"];
    chatAppend(newMessage.text, newMessage.senderId);
    console.log(`${newMessage.senderId} sent message: ${newMessage.text}`);
  } else if (parsedData.hasOwnProperty('color_list')) {
    color_list = parsedData["color_list"];
    console.log(`color list: ${color_list}`);
  }

});

conn.addEventListener("open", async () => {
  console.log("Connected!");
});

// Get the send button and text field elements
const sendButton = document.getElementById("send_button") as HTMLButtonElement;
const textField = document.getElementById("text_field") as HTMLInputElement;
const chatBox = document.getElementById("messages_box") as HTMLInputElement;

// Add a keydown event listener to the text field
textField.addEventListener("keydown", (event) => {
  // Check if the enter key was pressed and the text field is not empty
  if (event.key === "Enter" && textField.value.trim() !== "") {
    // Click the send button
    sendButton.click();
  }
});

// Add a click event listener to the send button
sendButton.addEventListener("click", () => {
  // Get the text from the text field
  const text = textField.value;
  
  // Send the text through conn.send
  conn.send(text);

  // Clear the text field
  textField.value = "";
});

function chatAppend(text: string, senderId: string): void { 
		
  let span = document.createElement('span');

  span.className = "chat_message";
  span.style.backgroundColor = getColorByUserId(senderId)

  let txt = document.createTextNode(text);
  span.appendChild(txt);
  chatBox.appendChild(span);
  if (chatBox.lastChild) {
    (chatBox.lastChild as HTMLElement).scrollIntoView(true);
  }
}

function getColorByUserId(userId: string): string {
  const userColor = color_list.find((element) => element.userId === userId);
  return userColor ? userColor.senderColor : "#000000";
}
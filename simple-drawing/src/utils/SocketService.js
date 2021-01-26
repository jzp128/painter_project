import io from "socket.io-client";

export default class SocketService {
  constructor() {
    this.socket = io.connect();
    this.socket.on('connect', () => {this.socketId = this.socket.id; console.log(this.socketId);})
    this.listeners = {};
  }

  // URL: data can be anything
  emit(url, options={}, data=null){
    this.socket.emit(url, data);
  }

  // this adds a listener to when the server emits something
  listen(url, callback){
    this.socket.on(url, (data) => callback(data));
  }
}
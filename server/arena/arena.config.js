"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
const uwebsockets_transport_1 = require("@colyseus/uwebsockets-transport");
const websockets_transport_1 = require("@colyseus/ws-transport");
/**
 * Import your Room files
 */
const MyRoom_1 = require("./rooms/MyRoom");
exports.default = arena_1.default({
    getId: () => "Your Colyseus App",
    initializeTransport: () => {
        return new uwebsockets_transport_1.uWebSocketsTransport({});
        // return new websockets_transport_1.WebSocketTransport({
        //     pingInterval: 5000,
        //     pingMaxRetries: 3,
        // });
    },
    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom_1.MyRoom);
    },
    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/test", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor_1.monitor());
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});

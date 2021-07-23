import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

export default Arena({
    getId: () => "Your Colyseus App",

    initializeGameServer: (gameServer) => {

      console.log("!! initializeGameServer");

        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);

    },

    initializeExpress: (app) => {
      console.log("!! initializeExpress");

        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
      console.log("!! beforeListen");
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
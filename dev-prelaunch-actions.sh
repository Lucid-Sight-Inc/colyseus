#!/bin/sh
echo "Importing Secret / Env";
FILE=/colyseus/app/server/arena/arena.secret.env
if test -f "$FILE"; then
    set -a # automatically export all variables
    source $FILE
    set +a
    while read line; do export $line; done < $FILE;
    export $(xargs <$FILE);
    echo "LOADED 'arena.secret.env' ID: $ID";
else 
    echo "'arena.secret.env' does not exist."
fi
echo "Check / Merge Override Package JSON";
cd ..
node packageCombine.js &&
sleep 5;

# echo "Adjusting Colyseus for Arena...";
# rm -r node_modules/colyseus
# rm -r /colyseus/node_modules/@colyseus
# sleep 5;
echo "Running NPM Install...";

npm install nodemon -g
npm install && npm cache clean --force &&
sleep 5;
cd app
echo "--- Completed Prelaunch ---";
# Hand off to the CMD
exec "$@"
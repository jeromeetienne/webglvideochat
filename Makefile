# makefile to automatize simple operations

server:
	forever -w --watchDirectory lib lib/server.js

serverProd:
	npm start

deploy:
	jitsu -c deploy

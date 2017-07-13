install:
	npm install

start:
	DEBUG="application:*" npm run nodemon -- --watch src --ext '.js,.pug' --exec npm run gulp -- server

pack:
	npm run build

publish:
	npm publish

lint:
	npm run eslint

test:
	npm test

build:
	npm run build

deploy:
	make build
	git add .
	git commit -am 'next'
	git push heroku master
	git push

hlogs:
	heroku logs --tail

init:
	npm run gulp init

console:
	npm run gulp console
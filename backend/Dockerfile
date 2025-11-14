# https://gist.github.com/nzvtrk/cba2970b1df9091b520811e521d9bd44

FROM node:12.14.1-alpine AS build

# If you have troubles with node-gyp use should install these dependencies 
RUN apk add g++ make python

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
# build js & remove devDependencies from node_modules
RUN npm run build && npm prune --production


FROM node:12.14.1-alpine

ENV PORT=3000
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules

# Migrations compiled while npm run build was call
RUN rm -rf /app/dist/migrations/*.d.ts /app/dist/migrations/*.map
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/scripts/wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x wait-for.sh

EXPOSE 3000
ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]
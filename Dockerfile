# 1) 构建阶段
FROM node:20-alpine AS build
WORKDIR /app

# 仅先拷贝依赖清单，充分利用缓存
COPY package*.json ./
RUN npm ci

# 拷贝剩余代码并构建
COPY . .
RUN npm run build

# 2) 运行阶段（Nginx）
FROM nginx:1.25-alpine

# 拷贝构建产物
COPY --from=build /app/dist /usr/share/nginx/html

# 替换默认站点配置，开启 SPA 回退
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
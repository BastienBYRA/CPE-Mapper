# Copyright 2025 Bastien BYRA

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#    http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:22-alpine3.21

LABEL org.opencontainers.image.authors="Bastien BYRA (GitHub)"
LABEL org.opencontainers.image.url="https://github.com/BastienBYRA/CPE-Mapper"
LABEL org.opencontainers.image.documentation="https://github.com/BastienBYRA/CPE-Mapper/blob/main/README.md"
LABEL org.opencontainers.image.source="https://github.com/BastienBYRA/CPE-Mapper"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Bastien BYRA"
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.created=""
LABEL org.opencontainers.image.revision=""

WORKDIR /cpe-mapper

COPY package*.json .
RUN npm ci --omit=dev

COPY . .

ENTRYPOINT ["node", "/cpe-mapper/src/cli.js"]
CMD ["help"]

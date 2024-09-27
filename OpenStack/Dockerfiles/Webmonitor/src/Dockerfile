# Stage 1: Build
# Set ARCHITECTURE variable from build arguments
ARG ARCHITECTURE
# Use CERN official image as the base image
FROM cern/alma9-base:20231001-1.${ARCHITECTURE} AS build
# Set NODE_VERSION variable from build arguments
ARG NODE_VERSION
# Set the working directory
WORKDIR /usr/local/app
# Add the source code to app
COPY ./ /usr/local/app/
# install Node.js and Agular, build app
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
RUN . ~/.nvm/nvm.sh && nvm install v${NODE_VERSION} && npm install --force && npm run build

# Stage 2: Production Image
# Set ARCHITECTURE variable from build arguments
ARG ARCHITECTURE
FROM cern/alma9-base:20231001-1.${ARCHITECTURE}
# Set the working directory
WORKDIR /usr/local/app
# Copy the build output from the previous stage
COPY --from=build /usr/local/app/dist/browser/* /usr/local/app/dist/webmonitor18/
# Install a lightweight HTTP server to serve the Angular app (e.g., serve)
RUN yum install -y epel-release \
    && yum install -y npm \
    && npm install -g serve \
    && yum clean all \
    && rm -rf /var/cache/yum
# Expose port 3000
EXPOSE 3000
# Add the Least Privileged User
RUN groupadd -r usr && useradd -g usr usr
# Change ownership of the nginx configuration and other necessary files
RUN chown -R usr:usr /usr/local/app/dist/webmonitor18
# Use the Least Privileged User
USER usr
# Start serving the Angular app on port 3000
CMD ["serve", "dist", "-l", "3000"]

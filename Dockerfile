ARG ARCHITECTURE
# Use CERN official image as the base image
FROM cern/alma9-base:20231001-1.${ARCHITECTURE}
# Set the working directory
WORKDIR /usr/local/app
# Set nginx version
RUN dnf module enable -y nginx:1.24
# Install nginx
RUN dnf install -y nginx
RUN rm -f /etc/nginx/nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
